import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

function UserDashboard() {
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <MDTypography variant="h4" fontWeight="medium" gutterBottom>
              🙋 USER 대시보드
            </MDTypography>
          </Grid>

          {/* 현재 대여중인 장비 */}
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3 }}>
              <MDTypography variant="subtitle1" color="text">
                현재 대여중인 장비
              </MDTypography>
              <MDTypography variant="h5" fontWeight="bold">
                2건
              </MDTypography>
            </Card>
          </Grid>

          {/* 누적 대여 횟수 */}
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3 }}>
              <MDTypography variant="subtitle1" color="text">
                누적 대여 횟수
              </MDTypography>
              <MDTypography variant="h5" fontWeight="bold">
                5회
              </MDTypography>
            </Card>
          </Grid>

          {/* 현재 벌점 */}
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3 }}>
              <MDTypography variant="subtitle1" color="text">
                누적 벌점
              </MDTypography>
              <MDTypography variant="h5" fontWeight="bold" color="error">
                2점
              </MDTypography>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default UserDashboard;
