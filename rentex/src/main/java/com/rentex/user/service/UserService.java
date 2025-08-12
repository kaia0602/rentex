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

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PartnerRepository partnerRepository; // Partner 가입 시 중복 체크용
    private final PasswordEncoder passwordEncoder;
    private final RentalRepository rentalRepository;   // ✅ RentalRepository 주입
    private final PenaltyRepository penaltyRepository;

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
                    .contactEmail(requestDTO.getContactEmail()) // 반영
                    .contactPhone(requestDTO.getContactPhone()) // 반영
                    .build();
        }
        else {
            newUser = new User(
                    requestDTO.getEmail(),
                    encodedPassword,
                    requestDTO.getName(),
                    requestDTO.getNickname());
        }

        User savedUser = userRepository.save(newUser);
        return savedUser.getId();
    }

    // ✅ 비밀번호 재설정 메서드 추가
    @Transactional
    public void resetPassword(String email, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("해당 이메일의 사용자를 찾을 수 없습니다."));

        // ✅ 비밀번호 변경 전에도 소셜 로그인 유저인지 확인
        if ("SOCIAL_LOGIN_PASSWORD".equals(user.getPassword())) {
            throw new IllegalArgumentException("소셜 로그인 사용자는 비밀번호를 변경할 수 없습니다.");
        }

        String encodedPassword = passwordEncoder.encode(newPassword);
        user.updatePassword(encodedPassword);
    }

    @Transactional(readOnly = true)
    public MyPageDTO getMyPageInfo(Long userId) {
        // 1. 사용자 정보 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 2. 사용자의 대여 내역 조회
        List<Rental> rentals = rentalRepository.findByUser(user);

        // 3. 사용자의 벌점 내역 조회
        List<Penalty> penalties = penaltyRepository.findByUser(user);

        // 4. DTO로 변환하여 반환
        return MyPageDTO.from(user, rentals, penalties);
    }

    // ✅ 프로필(닉네임) 업데이트 메서드
    @Transactional
    public void updateProfile(Long userId, ProfileUpdateRequestDTO requestDTO) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        user.updateNickname(requestDTO.getNickname());
        // @Transactional에 의해 메서드가 끝나면 변경된 닉네임이 DB에 자동으로 저장됩니다.
    }

    @Transactional
    public void withdrawUser(Long userId) {
        // 1. 사용자를 찾습니다.
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 2. 미반납 대여 건이 있는지 확인합니다.
        if (rentalRepository.existsByUserAndStatusNotIn(user,
                Arrays.asList(RentalStatus.RETURNED, RentalStatus.CANCELED, RentalStatus.REJECTED))) {
            throw new IllegalStateException("아직 반납하지 않은 대여 건이 있어 탈퇴할 수 없습니다.");
        }

        // 3. 미납 벌점이 있는지 확인합니다.
        if (penaltyRepository.existsByUserAndIsPaidFalse(user)) {
            throw new IllegalStateException("미납된 벌점이 있어 탈퇴할 수 없습니다.");
        }

        // 4. 모든 조건을 통과하면 탈퇴 처리 (soft delete)
        user.withdraw();
    }
}