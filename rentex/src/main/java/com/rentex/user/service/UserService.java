package com.rentex.user.service;

import com.rentex.admin.dto.MonthlyUserDTO;
import com.rentex.admin.dto.UserResponseDTO;
import com.rentex.item.repository.ItemRepository;
import com.rentex.penalty.domain.Penalty;
import com.rentex.penalty.repository.PenaltyRepository;
import com.rentex.rental.domain.Rental;
import com.rentex.rental.domain.RentalStatus;
import com.rentex.rental.repository.RentalRepository;
import com.rentex.user.domain.User;
import com.rentex.user.dto.MyPageDTO;
import com.rentex.user.dto.ProfileUpdateRequestDTO;
import com.rentex.user.dto.SignUpRequestDTO;
import com.rentex.user.repository.UserRepository;
import com.rentex.common.upload.ProfileImageUploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User.UserBuilder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RentalRepository rentalRepository;
    private final PenaltyRepository penaltyRepository;
    private final ItemRepository itemRepository;
    private final ProfileImageUploadService profileImageUploadService;

    /** 이메일로 조회 */
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    /** ID로 조회 */
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    /** 회원가입 */
    @Transactional
    public Long signUp(SignUpRequestDTO requestDTO) {
        Optional<User> existingOpt = userRepository.findByEmail(requestDTO.getEmail());

        if (existingOpt.isPresent()) {
            User existing = existingOpt.get();

            // 탈퇴회원이면 복구
            if (existing.getWithdrawnAt() != null) {
                existing.recover(); // withdrawnAt → null로 복구
                existing.updateName(requestDTO.getName());
                existing.updateNickname(requestDTO.getNickname());
                existing.updatePassword(passwordEncoder.encode(requestDTO.getPassword()));
                existing.updateBusinessNo(requestDTO.getBusinessNo());
                existing.updateContactEmail(requestDTO.getContactEmail());
                existing.updateContactPhone(requestDTO.getContactPhone());

                return existing.getId(); // 영속 상태라 save() 불필요
            }

            // 이미 활성화된 계정
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }

        // 신규 가입
        String encodedPassword = passwordEncoder.encode(requestDTO.getPassword());

        String role = "USER";
        if ("PARTNER".equalsIgnoreCase(requestDTO.getUserType())) {
            role = "PARTNER";
        }

        User newUser = User.builder()
                .email(requestDTO.getEmail())
                .password(encodedPassword)
                .name(requestDTO.getName())
                .nickname(requestDTO.getNickname())
                .role(role)
                .businessNo(requestDTO.getBusinessNo())
                .contactEmail(requestDTO.getContactEmail())
                .contactPhone(requestDTO.getContactPhone())
                .build();

        return userRepository.save(newUser).getId();
    }


    /** 비밀번호 재설정 */
    @Transactional
    public void resetPassword(String email, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("해당 이메일의 사용자를 찾을 수 없습니다."));

        if ("SOCIAL_LOGIN_PASSWORD".equals(user.getPassword())) {
            throw new IllegalArgumentException("소셜 로그인 사용자는 비밀번호를 변경할 수 없습니다.");
        }

        String encodedPassword = passwordEncoder.encode(newPassword);
        user.updatePassword(encodedPassword);
    }

    /** 마이페이지 정보 조회 */
    @Transactional(readOnly = true)
    public MyPageDTO getMyPageInfo(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        List<Rental> rentals = rentalRepository.findByUser(user);
        List<Penalty> penalties = penaltyRepository.findByUser(user);

        return MyPageDTO.from(user, rentals, penalties);
    }

    @Transactional
    public void updateProfile(Long userId, ProfileUpdateRequestDTO requestDTO) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        if (requestDTO.getNickname() != null) {
            user.updateNickname(requestDTO.getNickname());
        }
        if (requestDTO.getBusinessNo() != null) {
            user.updateBusinessNo(requestDTO.getBusinessNo());
        }
        if (requestDTO.getContactEmail() != null) {
            user.updateContactEmail(requestDTO.getContactEmail());
        }
        if (requestDTO.getContactPhone() != null) {
            user.updateContactPhone(requestDTO.getContactPhone());
        }
        if (requestDTO.getName() != null) { // 업체명
            user.updateName(requestDTO.getName());
        }
    }


    /** 회원 탈퇴 */
    @Transactional
    public void withdrawUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 아직 반납하지 않은 대여가 있으면 탈퇴 불가
        if (rentalRepository.existsByUserAndStatusNotIn(
                user,
                Arrays.asList(RentalStatus.RETURNED, RentalStatus.CANCELED, RentalStatus.REJECTED))) {
            throw new IllegalStateException("아직 반납하지 않은 대여 건이 있어 탈퇴할 수 없습니다.");
        }

        // 미결제 패널티가 있으면 탈퇴 불가
        if (penaltyRepository.existsByUserAndPaidFalse(user)) {
            throw new IllegalStateException("패널티가 결제되지 않아 계정을 삭제할 수 없습니다.");
        }

        // ✅ 패널티 레코드 선삭제
        penaltyRepository.deleteByUser_Id(userId);

        // soft delete
        user.withdraw();

        // hard delete 하고 싶으면 이걸로 교체:
//         userRepository.deleteById(userId);
    }

    /** ID로 강제 조회 */
    @Transactional(readOnly = true)
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + id));
    }

    // =====================================
    // ✅ 관리자 조회용
    // =====================================

    @Transactional(readOnly = true)
    public List<UserResponseDTO> getAllUsers() {
        return userRepository.findAllUsersForAdmin();
    }

    @Transactional(readOnly = true)
    public List<UserResponseDTO> getUsersByRole(String role) {
        return userRepository.findAllByRole(role.toUpperCase());
    }

    /** 편의: 이메일로 조회(예외) */
    @Transactional(readOnly = true)
    public User getOrThrowByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + email));
    }

    /** 액세스 토큰 생성을 위한 Authentication 빌드 */
    @Transactional(readOnly = true)
    public Authentication buildAuthentication(User user) {
        // 스프링 시큐리티 UserDetails 구성
        UserBuilder builder = org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getPassword()) // 패스워드는 토큰 생성 시 검증에 쓰이지 않지만 형태 맞춰둠
                .authorities(new SimpleGrantedAuthority("ROLE_" + user.getRole()))
                .accountExpired(false).accountLocked(false).credentialsExpired(false).disabled(false);

        UserDetails details = builder.build();
        return new UsernamePasswordAuthenticationToken(details, null, details.getAuthorities());
    }

    public List<MonthlyUserDTO> getMonthlyNewUsers(int year) {
        String from = year + "-01-01";
        String to = year + "-12-31";

        List<Object[]> rawData = userRepository.findMonthlyNewUsers(from, to);

        // 1~12월 기본 배열
        List<MonthlyUserDTO> months = new ArrayList<>();
        for (int i = 1; i <= 12; i++) {
            String monthLabel = i + "월";
            long count = 0;
            for (Object[] row : rawData) {
                int month = Integer.parseInt(((String) row[0]).split("-")[1]);
                if (month == i) {
                    count = ((Number) row[1]).longValue();
                    break;
                }
            }
            months.add(new MonthlyUserDTO(monthLabel, count));
        }

        return months;
    }

    @Transactional
    public void deleteUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new IllegalStateException("존재하지 않는 사용자입니다.");
        }
        userRepository.deleteById(userId);
    }

    // 프로필 이미지
    @Transactional
    public User updateProfileImage(Long userId, MultipartFile profileImage) throws IOException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        String imagePath = profileImageUploadService.uploadAndResize(profileImage);

        user.updateProfileImage(imagePath);
        return user;
    }

    /** 프로필 이미지 URL로 직접 업데이트 */
    @Transactional
    public void updateProfileImageUrl(Long userId, String imageUrl) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + userId));
        user.updateProfileImage(imageUrl);
    }

    /** 프로필 이미지 삭제 */
    @Transactional
    public void deleteProfileImage(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + userId));
        user.updateProfileImage(null);
    }
}
