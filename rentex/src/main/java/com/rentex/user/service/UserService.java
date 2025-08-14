package com.rentex.user.service;

import com.rentex.partner.domain.Partner;
import com.rentex.partner.repository.PartnerRepository;
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

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PartnerRepository partnerRepository; // Partner 가입 시 중복 체크용
    private final PasswordEncoder passwordEncoder;
    private final RentalRepository rentalRepository;
    private final PenaltyRepository penaltyRepository;

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    @Transactional
    public Long signUp(SignUpRequestDTO requestDTO) {
        if (userRepository.findByEmail(requestDTO.getEmail()).isPresent()) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }

        String encodedPassword = passwordEncoder.encode(requestDTO.getPassword());
        User newUser;

        if ("PARTNER".equalsIgnoreCase(requestDTO.getUserType())) {
            newUser = Partner.builder()
                    .email(requestDTO.getEmail())
                    .password(encodedPassword)
                    .name(requestDTO.getName())
                    .nickname(requestDTO.getNickname())
                    .businessNo(requestDTO.getBusinessNo())
                    .contactEmail(requestDTO.getContactEmail())
                    .contactPhone(requestDTO.getContactPhone())
                    .build();
        } else {
            newUser = new User(
                    requestDTO.getEmail(),
                    encodedPassword,
                    requestDTO.getName(),
                    requestDTO.getNickname());
        }

        User savedUser = userRepository.save(newUser);
        return savedUser.getId();
    }

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
        user.updateNickname(requestDTO.getNickname());
    }

    @Transactional
    public void withdrawUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        if (rentalRepository.existsByUserAndStatusNotIn(
                user,
                Arrays.asList(RentalStatus.RETURNED, RentalStatus.CANCELED, RentalStatus.REJECTED))) {
            throw new IllegalStateException("아직 반납하지 않은 대여 건이 있어 탈퇴할 수 없습니다.");
        }

        if (penaltyRepository.existsByUserAndPaidFalse(user)) {
            throw new IllegalStateException("패널티가 결제되지 않아 계정을 삭제할 수 없습니다.");
        }

        // ✅ 패널티 레코드 선삭제
        penaltyRepository.deleteByUserId(userId);

        // soft delete 유지 시:
        // user.withdraw();

        // 실제 삭제 시:
        userRepository.deleteById(userId);
    }

    /**
     * 로그인된 사용자 이메일로 User 엔티티 조회.
     * 존재하지 않을 경우 IllegalArgumentException 발생.
     */
    @Transactional(readOnly = true)
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + id));
    }
}
