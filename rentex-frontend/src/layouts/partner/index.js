// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import { Link } from "react-router-dom";
import { getToken, getUserIdFromToken } from "utils/auth";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Layout components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "layouts/authentication/components/Footer";
import PartnerMonthlyRevenueChart from "./components/PartnerMonthlyRevenueChart";

// Partner Header
import Header from "layouts/partner/components/Header";

import React, { useEffect, useState } from "react";
import api from "api/client";

function Overview() {
  const partnerMenus = [
    { title: "장비 등록", icon: "add_circle", path: "/partner/items/new" },
    { title: "장비 목록", icon: "inventory_2", path: "/partner/items" },
    { title: "대여 관리", icon: "assignment", path: "/partner/rentals/manage" },
    { title: "대여 요청 처리", icon: "playlist_add_check", path: "/partner/rentals" },
    { title: "정산 내역", icon: "request_quote", path: "/partner/statistics" },
    { title: "설정", icon: "settings", path: "/partner/settings" },
  ];

  const [itemCount, setItemCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [returnRequestedCount, setReturnRequestedCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalRevenueAllTime, setTotalRevenueAllTime] = useState(0);
  const NOW = new Date();
  const token = getToken();
  const partnerId = token ? getUserIdFromToken(token) : null;
  useEffect(() => {
    const fetchRevenue = async () => {
      if (!partnerId) return;

      try {
        const res = await api.get(`/partner/statistics/${partnerId}`, {
          params: { year: NOW.getFullYear(), month: NOW.getMonth() + 1 },
        });
        const data = res.data;
        // totalRevenue는 이미 백엔드에서 계산되어 내려옴
        setTotalRevenue(data?.totalRevenue ?? 0);
        setTotalRevenueAllTime(data?.totalRevenueAllTime ?? 0);
      } catch (error) {
        console.error("총 수익 조회 실패:", error);
        setTotalRevenue(0);
        setTotalRevenueAllTime(0);
      }
    };

    fetchRevenue();
  }, [partnerId]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get("/partners/dashboard"); // PartnerDashboardDTO 반환
        const data = res.data;
        setItemCount(data.registeredItemCount);
        setPendingCount(data.pendingRentalCount);
        setActiveCount(data.activeRentalCount || 0); // activeCount가 DTO에 없다면 0 처리
        setReturnRequestedCount(data.returnRequestedCount || 0);
      } catch (error) {
        console.error("대시보드 정보 조회 실패:", error);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mb={2} />
      <Header>
        {/* 정보 카드 영역 */}
        <MDBox mt={5} mb={3}>
          <Grid container spacing={3}>
            {/* 왼쪽 등록 장비 */}
            <Grid item xs={12} md={3}>
              <Card
                sx={{
                  p: 3,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  height: "100%",
                }}
              >
                <MDBox>
                  <MDTypography variant="subtitle1" color="text">
                    등록 장비
                  </MDTypography>
                  <MDTypography variant="h5" fontWeight="bold" sx={{ mt: 1 }}>
                    {itemCount === 0
                      ? "등록된 장비가 없습니다!"
                      : `현재 ${itemCount || 0}개의 장비가 등록되어 있습니다.`}
                  </MDTypography>
                </MDBox>
                <MDBox mt={2}>
                  <Link to="/partner/items" style={{ textDecoration: "none", color: "#1976d2" }}>
                    자세히 보기 →
                  </Link>
                </MDBox>
              </Card>
            </Grid>

            {/* 가운데 3행 */}
            <Grid item xs={12} md={5}>
              <Grid container spacing={3} direction="column">
                {/* 대기 중인 대여 요청 */}
                <Grid item>
                  <Card
                    sx={{
                      p: 3,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      height: "100%",
                    }}
                  >
                    <MDBox>
                      <MDTypography variant="subtitle1" color="text">
                        대기 중인 대여 요청
                      </MDTypography>
                      <MDTypography variant="h5" fontWeight="bold" sx={{ mt: 1 }}>
                        {pendingCount === 0
                          ? "현재 대여 중인 요청이 없습니다!"
                          : `현재 ${pendingCount || 0}건의 대여 요청이 있습니다.`}
                      </MDTypography>
                    </MDBox>
                    <MDBox mt={2}>
                      <Link
                        to="/partner/rentals"
                        style={{ textDecoration: "none", color: "#1976d2" }}
                      >
                        자세히 보기 →
                      </Link>
                    </MDBox>
                  </Card>
                </Grid>

                {/* 대여 중인 장비 */}
                <Grid item>
                  <Card
                    sx={{
                      p: 3,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      height: "100%",
                    }}
                  >
                    <MDBox>
                      <MDTypography variant="subtitle1" color="text">
                        대여 중인 장비
                      </MDTypography>
                      <MDTypography variant="h5" fontWeight="bold" sx={{ mt: 1 }}>
                        {activeCount === 0
                          ? "현재 대여중인 장비가 없습니다!"
                          : `현재 ${activeCount}개의 장비가 대여중입니다.`}
                      </MDTypography>
                    </MDBox>
                    <MDBox mt={2}>
                      <Link
                        to="/partner/rentals/manage"
                        style={{ textDecoration: "none", color: "#1976d2" }}
                      >
                        자세히 보기 →
                      </Link>
                    </MDBox>
                  </Card>
                </Grid>

                {/* 반납 요청 중인 장비 */}
                <Grid item>
                  <Card
                    sx={{
                      p: 3,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      height: "100%",
                    }}
                  >
                    <MDBox>
                      <MDTypography variant="subtitle1" color="text">
                        반납 요청 중인 장비
                      </MDTypography>
                      <MDTypography variant="h5" fontWeight="bold" sx={{ mt: 1 }}>
                        {returnRequestedCount === 0
                          ? "현재 반납 요청 중인 장비가 없습니다!"
                          : `현재 ${returnRequestedCount}개의 장비가 반납 요청 중입니다.`}
                      </MDTypography>
                    </MDBox>
                    <MDBox mt={2}>
                      <Link
                        to="/partner/rentals/manage"
                        style={{ textDecoration: "none", color: "#1976d2" }}
                      >
                        자세히 보기 →
                      </Link>
                    </MDBox>
                  </Card>
                </Grid>
              </Grid>
            </Grid>

            {/* 오른쪽 이번 달 수익 */}
            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  p: 3,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  height: "100%",
                }}
              >
                <MDBox>
                  <MDTypography variant="subtitle1" color="text">
                    이번 달 수익: <b>{totalRevenue.toLocaleString()}원</b>
                  </MDTypography>
                  <MDTypography variant="h5" fontWeight="bold" color="success" sx={{ mt: 1 }}>
                    총 수익: <b>{totalRevenueAllTime.toLocaleString()}원</b>
                  </MDTypography>
                </MDBox>
                {/* 월별 그래프 추가 */}
                <MDBox mt={4} height={300}>
                  <PartnerMonthlyRevenueChart year={NOW.getFullYear()} partnerId={partnerId} />
                </MDBox>
                <MDBox mt={2}>
                  <Link
                    to="/partner/statistics"
                    style={{ textDecoration: "none", color: "#1976d2" }}
                  >
                    자세히 보기 →
                  </Link>
                </MDBox>
              </Card>
            </Grid>
          </Grid>
        </MDBox>

        {/* 파트너 메뉴 카드 */}
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
                      boxShadow: "0 4px 6px rgba(0,0,0,0.1),0 1px 3px rgba(0,0,0,0.08)",
                      transition: "transform 0.3s ease, box-shadow 0.3s ease",
                      background: "linear-gradient(135deg, #f1f8e9 0%, #c5e1a5 100%)",
                      color: "#33691e",
                      "&:hover": {
                        transform: "scale(1.05)",
                        boxShadow: "0 8px 16px rgba(0,0,0,0.2),0 4px 8px rgba(0,0,0,0.12)",
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
      </Header>
      <Footer />
    </DashboardLayout>
  );
}

export default Overview;
