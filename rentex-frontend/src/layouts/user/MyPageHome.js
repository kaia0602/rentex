import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DataTable from "examples/Tables/DataTable";

function MyPageHome() {
  // 더미 요약 데이터
  const summary = {
    rentalsInProgress: 2,
    penalties: 1,
    unpaidPenalty: false,
  };

  // 최근 대여 더미
  const columns = [
    { Header: "ID", accessor: "id", align: "center" },
    { Header: "장비", accessor: "item", align: "center" },
    { Header: "기간", accessor: "period", align: "center" },
    { Header: "상태", accessor: "status", align: "center" },
  ];
  const rows = [
    { id: 15, item: "카메라 A", period: "08-10 ~ 08-14", status: "RENTED" },
    { id: 14, item: "드론 B", period: "08-01 ~ 08-05", status: "RETURNED" },
  ];

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        {/* 인사말 */}
        <MDTypography variant="h4" mb={3}>
          👋 홍길동 님, 환영합니다!
        </MDTypography>

        {/* 요약 카드 3개 */}
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="button" color="text">
                  진행 중 대여
                </MDTypography>
                <MDTypography variant="h4" fontWeight="bold">
                  {summary.rentalsInProgress}
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="button" color="text">
                  누적 벌점
                </MDTypography>
                <MDTypography variant="h4" fontWeight="bold" color="error">
                  {summary.penalties}
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <MDBox p={3} display="flex" flexDirection="column" gap={1}>
                <MDTypography variant="button" color="text">
                  패널티 결제
                </MDTypography>
                {summary.unpaidPenalty ? (
                  <MDButton color="error" size="small" href="/mypage/pay-penalty">
                    결제 필요
                  </MDButton>
                ) : (
                  <MDTypography variant="h6" color="success">
                    완료
                  </MDTypography>
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>

        {/* 최근 대여 테이블 */}
        <MDBox mb={2} display="flex" justifyContent="space-between" alignItems="center">
          <MDTypography variant="h6">최근 대여 내역</MDTypography>
          <MDButton variant="text" color="info" size="small" href="/mypage/rentals">
            더보기
          </MDButton>
        </MDBox>
        <DataTable
          table={{ columns, rows }}
          entriesPerPage={false}
          showTotalEntries={false}
          isSorted={false}
          noEndBorder
        />

        {/* 하단 버튼 */}
        <MDBox mt={4} display="flex" gap={2}>
          <MDButton color="info" href="/mypage/edit">
            내 정보 수정
          </MDButton>
          <MDButton variant="outlined" color="error" href="/mypage/penalty">
            벌점 내역
          </MDButton>
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default MyPageHome;
