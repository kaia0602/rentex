import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { Card } from "@mui/material";

function UserGuide() {
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={4} px={3}>
        <Card sx={{ p: 3 }}>
          <MDTypography variant="h5" fontWeight="bold" mb={3}>
            📘 Rentex 이용 가이드
          </MDTypography>

          {/* 대여 프로세스 */}
          <MDTypography variant="h6" mb={1}>
            1. 대여 신청
          </MDTypography>
          <MDTypography variant="body2" gutterBottom>
            원하는 장비 상세 페이지에서 대여 기간과 수량을 입력 후 신청할 수 있습니다.
          </MDTypography>

          <MDTypography variant="h6" mt={2} mb={1}>
            2. 대여 승인 및 수령
          </MDTypography>
          <MDTypography variant="body2" gutterBottom>
            파트너가 대여 요청을 확인 후 승인하면 장비를 수령할 수 있습니다.
          </MDTypography>

          <MDTypography variant="h6" mt={2} mb={1}>
            3. 반납 및 검수
          </MDTypography>
          <MDTypography variant="body2" gutterBottom>
            사용 완료 후 반납 요청을 등록하면, 파트너가 검수 후 반납이 완료됩니다.
          </MDTypography>

          {/* 벌점/패널티 */}
          <MDTypography variant="h6" mt={3} mb={1}>
            ⚠️ 벌점 및 패널티
          </MDTypography>
          <ul style={{ paddingLeft: 20 }}>
            <li>
              <MDTypography variant="body2">
                반납 지연 시 벌점 1점 부여 (연체일수에 따라 추가될 수 있음)
              </MDTypography>
            </li>
            <li>
              <MDTypography variant="body2">파손·분실 발생 시 최대 3점 부여</MDTypography>
            </li>
            <li>
              <MDTypography variant="body2">
                벌점 3점 이상 누적 시 대여 제한 (패널티 결제 후 초기화 가능)
              </MDTypography>
            </li>
          </ul>

          {/* 결제 */}
          <MDTypography variant="h6" mt={3} mb={1}>
            💳 결제
          </MDTypography>
          <MDTypography variant="body2">
            대여 요금 및 패널티는 마이페이지의 결제 내역에서 확인할 수 있으며, 카드 또는 계좌이체로
            결제 가능합니다.
          </MDTypography>
        </Card>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default UserGuide;
