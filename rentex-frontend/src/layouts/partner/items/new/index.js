import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

function NewItemForm() {
  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: 제출 로직
    alert("장비 등록 요청 완료 (임시)");
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mt={4}>
        <Card>
          <MDBox p={3}>
            <MDTypography variant="h6" gutterBottom>
              📦 장비 등록 요청
            </MDTypography>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <MDInput label="장비명" fullWidth required />
                </Grid>
                <Grid item xs={12} md={6}>
                  <MDInput label="모델명" fullWidth required />
                </Grid>
                <Grid item xs={12} md={6}>
                  <MDInput label="카테고리" fullWidth />
                </Grid>
                <Grid item xs={12} md={6}>
                  <MDInput label="총 수량" type="number" fullWidth />
                </Grid>
                <Grid item xs={12}>
                  <MDInput label="설명" fullWidth multiline rows={4} />
                </Grid>
              </Grid>
              <MDBox mt={3}>
                <MDButton type="submit" color="info">
                  등록 요청
                </MDButton>
              </MDBox>
            </form>
          </MDBox>
        </Card>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default NewItemForm;
