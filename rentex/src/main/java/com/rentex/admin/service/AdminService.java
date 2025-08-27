package com.rentex.admin.service;

import com.rentex.admin.dto.AdminDashboardDTO;
import com.rentex.admin.dto.UserResponseDTO;
import com.rentex.payment.repository.PaymentRepository;
import com.rentex.penalty.repository.PenaltyRepository;
import com.rentex.rental.dto.RentalResponseDto;
import com.rentex.rental.repository.RentalRepository;
import com.rentex.user.domain.User;
import com.rentex.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final RentalRepository rentalRepository;
    private final PaymentRepository paymentRepository;
    private final PenaltyRepository penaltyRepository;

    /** 전체 사용자 조회 (탈퇴자 포함) */
    @Transactional(readOnly = true)
    public List<UserResponseDTO> getAllUsers() {
        return userRepository.findAllUsersForAdmin();
    }

    /** 역할별 조회 (USER / PARTNER / ADMIN, 탈퇴자 포함) */
    @Transactional(readOnly = true)
    public List<UserResponseDTO> getUsersByRole(String role) {
        String r = role == null ? "" : role.toUpperCase();
        return userRepository.findAllByRole(r);
    }

    /** 단일 사용자 조회 (운영정책: 탈퇴자 포함) */
    @Transactional(readOnly = true)
    public UserResponseDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다. ID=" + id));
        return new UserResponseDTO(user);
        // 🔄 만약 탈퇴자 제외가 필요하면 한 줄만 교체:
        // User user = userRepository.findByIdAndWithdrawnAtIsNull(id)
        //        .orElseThrow(() -> new IllegalArgumentException("활성 사용자를 찾을 수 없습니다. ID=" + id));
    }

    /** 대시보드 요약 */
    @Transactional(readOnly = true)
    public AdminDashboardDTO getDashboardStats() {
        long users = userRepository.countByRole("USER");     // 탈퇴자 포함
        long partners = userRepository.countByRole("PARTNER");
        long transactions = rentalRepository.count();
        Long revenue = paymentRepository.sumAdminRevenue();

        return new AdminDashboardDTO(
                users,
                partners,
                transactions,
                revenue != null ? revenue : 0
        );
    }

    /** 특정 유저의 대여내역 (DTO 변환 from() 활용) */
    @Transactional(readOnly = true)
    public List<RentalResponseDto> getUserRents(Long userId) {
        return rentalRepository.findByUserId(userId).stream()
                .map(RentalResponseDto::from)
                .toList();
    }

    @Transactional
    public void withdrawUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("존재하지 않는 사용자입니다."));

        if (user.getWithdrawnAt() != null) {
            return; // 이미 탈퇴 처리된 경우
        }

        // 개인정보 마스킹(선택) - 이메일 충돌 방지용
        String suffix = "__deleted__" + id;
        user.updateNickname("탈퇴회원");
        user.updateName("탈퇴회원");
        user.updateProfileImage(null);
        user.withdraw(); // withdrawnAt = now

        // 필요하다면 이메일도 중복 방지를 위해 변경
        // user.setEmail(user.getEmail() + suffix);
    }

}
