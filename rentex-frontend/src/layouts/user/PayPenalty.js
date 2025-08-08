import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

function PayPenalty() {
  const penaltyCount = 3; // 더미 기준

  const handlePay = () => {
    alert("패널티 결제가 완료되었습니다.\n벌점이 초기화됩니다.");
    // 실제 결제 로직 & 상태 초기화는 나중에 처리
    window.location.href = "/mypage"; // 마이페이지로 리디렉션
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container justifyContent="center">
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 4, textAlign: "center" }}>
              <MDTypography variant="h5" color="error" gutterBottom>
                누적 벌점: {penaltyCount}점
              </MDTypography>
              <MDTypography variant="body1" mb={3}>
                벌점이 3점 이상으로 누적되어 대여가 제한되었습니다.
                <br />
                아래 버튼을 눌러 패널티 결제를 진행해주세요.
              </MDTypography>
              <Button variant="contained" color="error" size="large" onClick={handlePay}>
                패널티 결제하기
              </Button>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default PayPenalty;
