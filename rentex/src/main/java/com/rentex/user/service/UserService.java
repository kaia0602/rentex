package com.rentex.user.service;

import com.rentex.partner.domain.Partner;
import com.rentex.partner.repository.PartnerRepository;
import com.rentex.penalty.domain.Penalty;
import com.rentex.penalty.repository.PenaltyRepository;
import com.rentex.rental.domain.Rental;
import com.rentex.rental.domain.RentalStatus;
import com.rentex.rental.repository.RentalRepository;
import com.rentex.user.domain.User;
import com.rentex.user.domain.User.UserStatus;
import com.rentex.user.dto.MyPageDTO;
import com.rentex.user.dto.ProfileUpdateRequestDTO;
import com.rentex.user.dto.SignUpRequestDTO;
import com.rentex.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PartnerRepository partnerRepository;
    private final PasswordEncoder passwordEncoder;
    private final RentalRepository rentalRepository;
    private final PenaltyRepository penaltyRepository;
    private final EmailService emailService; // 추가

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
                    .status(UserStatus.PENDING)
                    .build();
        } else {
            newUser = new User(
                    requestDTO.getEmail(),
                    encodedPassword,
                    requestDTO.getName(),
                    requestDTO.getNickname());
        }

        String verificationToken = UUID.randomUUID().toString();
        newUser.setEmailVerificationToken(verificationToken);
        newUser.setTokenExpirationDate(LocalDateTime.now().plusHours(24));

        User savedUser = userRepository.save(newUser);

        // HTML 이메일 전송
        String verificationUrl = "http://localhost:8080/api/auth/verify-email?token=" + verificationToken;
        String htmlContent = "<!DOCTYPE html>" +
                "<html lang='ko'>" +
                "<head>" +
                "<meta charset='UTF-8'>" +
                "</head>" +
                "<body style=\"font-family: 'Apple SD Gothic Neo', 'sans-serif' !important;\">" +
                "  <div style=\"max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);\">" +
                "    <div style=\"font-size: 24px; font-weight: bold; color: #333; text-align: center; margin-bottom: 20px;\">Rentex 회원가입 인증</div>" +
                "    <div style=\"font-size: 16px; color: #555; line-height: 1.6;\">" +
                "      <p>회원가입을 완료하려면 아래 버튼을 클릭하여 이메일을 인증해주세요.</p>" +
                "      <div style=\"text-align: center; margin: 20px 0;\">" +
                "        <a href=\"" + verificationUrl + "\" style=\"display: inline-block; padding: 15px 30px; font-size: 18px; color: #ffffff; background-color: #007bff; border-radius: 5px; text-decoration: none; font-weight: bold;\">" +
                "          이메일 인증하기" +
                "        </a>" +
                "      </div>" +
                "      <p>만약 회원가입을 요청하지 않으셨다면, 이 이메일을 무시하셔도 됩니다.</p>" +
                "    </div>" +
                "    <div style=\"font-size: 12px; color: #999; text-align: center; margin-top: 20px;\">" +
                "      <p>본 이메일은 발신 전용입니다.</p>" +
                "      <p>&copy; 2025 Rentex. All Rights Reserved.</p>" +
                "    </div>" +
                "  </div>" +
                "</body>" +
                "</html>";
        emailService.sendHtmlMessage(savedUser.getEmail(), "[Rentex] 회원가입 이메일 인증", htmlContent);

        return savedUser.getId();
    }

    // 이메일 인증 토큰으로 사용자 찾는 메서드 추가
    public Optional<User> findByEmailVerificationToken(String token) {
        return userRepository.findByEmailVerificationToken(token);
    }

    // 사용자 상태 업데이트 메서드 추가
    @Transactional
    public void activateUser(User user) {
        user.activateAccount();
        userRepository.save(user);
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

        if (requestDTO.getName() != null && !requestDTO.getName().isBlank()) {
            user.setName(requestDTO.getName());
        }

        if (requestDTO.getNickname() != null && !requestDTO.getNickname().isBlank()) {
            user.setNickname(requestDTO.getNickname());
        }

        if (requestDTO.getPhone() != null && !requestDTO.getPhone().isBlank()) {
            if (user instanceof Partner partner) {
                partner.setContactPhone(requestDTO.getPhone());
            }
        }
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

        penaltyRepository.deleteByUserId(userId);

        userRepository.deleteById(userId);
    }

    @Transactional(readOnly = true)
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + email));
    }
}