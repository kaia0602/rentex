package com.rentex.user.service;

import com.rentex.admin.dto.UserResponseDTO;
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
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User.UserBuilder;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collections;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RentalRepository rentalRepository;
    private final PenaltyRepository penaltyRepository;

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
        if (userRepository.findByEmail(requestDTO.getEmail()).isPresent()) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }

        String encodedPassword = passwordEncoder.encode(requestDTO.getPassword());

        // userType이 null이면 USER로 기본 세팅
        String role = (requestDTO.getUserType() == null) ? "USER" : requestDTO.getUserType().toUpperCase();

        User newUser = User.builder()
                .email(requestDTO.getEmail())
                .password(encodedPassword)
                .name(requestDTO.getName())
                .nickname(requestDTO.getNickname())
                .role(role) // USER / PARTNER / ADMIN
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

    /** 프로필 수정 */
    @Transactional
    public void updateProfile(Long userId, ProfileUpdateRequestDTO requestDTO) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        user.updateNickname(requestDTO.getNickname());
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
        // userRepository.deleteById(userId);
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
}
