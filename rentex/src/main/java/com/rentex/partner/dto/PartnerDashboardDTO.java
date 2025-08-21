package com.rentex.partner.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class PartnerDashboardDTO {
    private Long registeredItemCount;
    private Long pendingRentalCount;
    private Long returnRequestedCount;
    private Long activeRentalCount;


    public PartnerDashboardDTO(Long registeredCount, Long pendingRentalCount, Long returnRequestedCount,  Long activeRentalCount) {
        this.registeredItemCount = registeredCount;
        this.pendingRentalCount = pendingRentalCount;
        this.returnRequestedCount = returnRequestedCount;
        this.activeRentalCount = activeRentalCount;
    }
}
