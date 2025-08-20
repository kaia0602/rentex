import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import React, { useEffect, useState } from "react";
import api from "api/client"; // axios 인스턴스

function PartnerDashboard() {
  const [itemCount, setItemCount] = useState(0);

  useEffect(() => {
    const fetchItemCount = async () => {
      try {
        const res = await api.get("/partner/items/count");
        setItemCount(res.data);
      } catch (error) {
        console.error("장비 수 조회 실패:", error);
      }
    };
    fetchItemCount();
  }, []);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <MDTypography variant="h4" fontWeight="medium" gutterBottom>
              🏭 파트너 대시보드
            </MDTypography>
          </Grid>

          {/* 등록된 장비 수 카드 */}
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3 }}>
              <MDTypography variant="subtitle1" color="text">
                등록 장비 수
              </MDTypography>
              <MDTypography variant="h5" fontWeight="bold">
                {itemCount}개
              </MDTypography>
            </Card>
          </Grid>

          {/* 대여 요청 수 카드 */}
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3 }}>
              <MDTypography variant="subtitle1" color="text">
                대기 중인 수령 요청
              </MDTypography>
              <MDTypography variant="h5" fontWeight="bold">
                3건
              </MDTypography>
            </Card>
          </Grid>

          {/* 이번 달 수익 */}
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3 }}>
              <MDTypography variant="subtitle1" color="text">
                이번 달 수익
              </MDTypography>
              <MDTypography variant="h5" fontWeight="bold" color="success">
                105,000원
              </MDTypography>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default PartnerDashboard;
