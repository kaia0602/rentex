import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import { Link } from "react-router-dom";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "layouts/authentication/components/Footer";
import React, { useEffect, useState } from "react";
import api from "api/client"; // axios 인스턴스

const partnerMenus = [
  { title: "장비 등록", icon: "add_circle", path: "/partner/items/new" },
  { title: "장비 목록", icon: "inventory_2", path: "/partner/items" },
  { title: "대여 관리", icon: "assignment", path: "/partner/rentals/manage" },
  { title: "대여 요청 처리", icon: "playlist_add_check", path: "/partner/rentals" },
  { title: "정산 내역", icon: "request_quote", path: "/partner/statistics" },
  { title: "설정", icon: "settings", path: "/partner/settings" },
];

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
        {/* 상단 통계 카드 */}
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
                등록 장비
              </MDTypography>
              <MDTypography variant="h5" fontWeight="bold">
                {itemCount}개
              </MDTypography>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3 }}>
              <MDTypography variant="subtitle1" color="text">
                대기 중인 대여 요청
              </MDTypography>
              <MDTypography variant="h5" fontWeight="bold">
                {itemCount}개
              </MDTypography>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3 }}>
              <MDTypography variant="subtitle1" color="text">
                대여중인 장비
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

        {/* 메뉴 카드 */}
        <MDBox mt={6}>
          <MDTypography variant="h5" mb={3} fontWeight="bold">
            ⚙️ 파트너 기능
          </MDTypography>
          <Grid container spacing={4} justifyContent="center">
            {partnerMenus.map(({ title, icon, path }) => (
              <Grid item xs={12} sm={6} md={4} key={title}>
                <Link to={path} style={{ textDecoration: "none" }}>
                  <Card
                    sx={{
                      p: 4,
                      textAlign: "center",
                      height: "180px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 3,
                      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)",
                      transition: "transform 0.3s ease, box-shadow 0.3s ease",
                      background: "linear-gradient(135deg, #f1f8e9 0%, #c5e1a5 100%)",
                      color: "#33691e",
                      "&:hover": {
                        transform: "scale(1.05)",
                        boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2), 0 4px 8px rgba(0, 0, 0, 0.12)",
                        cursor: "pointer",
                      },
                    }}
                  >
                    <Icon fontSize="large" sx={{ mb: 2 }}>
                      {icon}
                    </Icon>
                    <MDTypography variant="h6" fontWeight="medium" sx={{ userSelect: "none" }}>
                      {title}
                    </MDTypography>
                  </Card>
                </Link>
              </Grid>
            ))}
          </Grid>
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default PartnerDashboard;
