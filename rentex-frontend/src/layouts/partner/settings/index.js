import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "layouts/authentication/components/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

function PartnerSettings() {
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mt={4}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={{ p: 3 }}>
              <MDTypography variant="h6" gutterBottom>
                업체 정보 수정
              </MDTypography>
              <Grid container spacing={2} mt={1}>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="업체명" defaultValue="렌텍스테크" />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="사업자 번호" defaultValue="123-45-67890" />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="대표 이메일" defaultValue="partner@example.com" />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="대표 전화번호" defaultValue="02-1234-5678" />
                </Grid>
                <Grid item xs={12}>
                  <Button variant="contained" color="primary">
                    저장하기
                  </Button>
                </Grid>
              </Grid>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default PartnerSettings;
