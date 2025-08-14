import { useParams } from "react-router-dom";
import { useState } from "react";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

function PartnerRentalDetail() {
  const { id } = useParams(); // 대여 ID

  // 더미 데이터 (API 연동 전)
  const [rental, setRental] = useState({
    item: "카메라 A",
    user: "홍길동",
    period: "2025-08-10 ~ 08-14",
    quantity: 1,
    status: "APPROVED", // APPROVED | RENTED | RETURN_REQUESTED
    requestedAt: "2025-08-09",
  });

  // 액션 버튼
  const handleRequest = (type) => {
    alert(`${type} 요청 전송 (가상).`);
    // TODO: PATCH /partner/rentals/{id}/{action}
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDTypography variant="h5" mb={3}>
          대여 상세 – ID: {id}
        </MDTypography>

        <Card>
          <MDBox p={3}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <MDTypography variant="button" color="text">
                  장비
                </MDTypography>
                <MDTypography variant="h6">{rental.item}</MDTypography>
              </Grid>
              <Grid item xs={12} md={6}>
                <MDTypography variant="button" color="text">
                  사용자
                </MDTypography>
                <MDTypography variant="h6">{rental.user}</MDTypography>
              </Grid>
              <Grid item xs={12} md={6}>
                <MDTypography variant="button" color="text">
                  기간
                </MDTypography>
                <MDTypography variant="h6">{rental.period}</MDTypography>
              </Grid>
              <Grid item xs={12} md={6}>
                <MDTypography variant="button" color="text">
                  수량
                </MDTypography>
                <MDTypography variant="h6">{rental.quantity}</MDTypography>
              </Grid>
              <Grid item xs={12} md={6}>
                <MDTypography variant="button" color="text">
                  상태
                </MDTypography>
                <MDTypography variant="h6" color="info">
                  {rental.status}
                </MDTypography>
              </Grid>
              <Grid item xs={12} md={6}>
                <MDTypography variant="button" color="text">
                  요청일
                </MDTypography>
                <MDTypography variant="h6">{rental.requestedAt}</MDTypography>
              </Grid>
            </Grid>

            {/* 액션 버튼 (상태별 분기) */}
            <MDBox mt={3} display="flex" gap={1}>
              <MDButton variant="outlined" href="/partner/rentals">
                목록으로
              </MDButton>

              {rental.status === "APPROVED" && (
                <MDButton color="info" onClick={() => handleRequest("수령 완료")}>
                  수령 완료 요청
                </MDButton>
              )}

              {rental.status === "RENTED" && (
                <MDButton color="warning" onClick={() => handleRequest("반납 완료")}>
                  반납 완료 요청
                </MDButton>
              )}
            </MDBox>
          </MDBox>
        </Card>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default PartnerRentalDetail;
