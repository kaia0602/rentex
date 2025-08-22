// src/layouts/admin/index.js
import React, { useEffect, useState } from "react";
import api from "api/client";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import { Link } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import PersonIcon from "@mui/icons-material/Person";
import ApartmentIcon from "@mui/icons-material/Apartment";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import Header from "layouts/admin/components/Header";
import { CardContent, Typography } from "@mui/material";
import { Box } from "@mui/system";

// 예시 데이터
const revenueData = [
  { month: "1월", revenue: 500000 },
  { month: "2월", revenue: 750000 },
  { month: "3월", revenue: 600000 },
  { month: "4월", revenue: 900000 },
  { month: "5월", revenue: 1200000 },
];

const usersData = [
  { month: "1월", newUsers: 50, totalUsers: 1000 },
  { month: "2월", newUsers: 70, totalUsers: 1070 },
  { month: "3월", newUsers: 60, totalUsers: 1130 },
  { month: "4월", newUsers: 80, totalUsers: 1210 },
  { month: "5월", newUsers: 90, totalUsers: 1300 },
];

const adminMenus = [
  { title: "대여 조회", icon: "assignment", path: "/admin/rentals" },
  { title: "업체 관리", icon: "apartment", path: "/admin/partners" },
  { title: "벌점 관리", icon: "gavel", path: "/admin/penalties" },
  { title: "정산 통계", icon: "bar_chart", path: "/admin/statistics" },
  { title: "사용자 관리", icon: "group", path: "/admin/users" },
];

function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    partners: 0,
    transactions: 0,
    revenue: 0,
  });

  const [notices, setNotices] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/admin/users/dashboard");
        setStats(res.data);
      } catch (error) {
        console.error("대시보드 통계 조회 실패:", error);
      }
    };

    const fetchNotices = async () => {
      try {
        // 최신 공지 3개만 가져오기
        const res = await api.get("/notices", { params: { page: 0, size: 3 } });
        setNotices(res.data.content || res.data.notices || []);
      } catch (error) {
        console.error("공지사항 조회 실패:", error);
      }
    };

    fetchStats();
    fetchNotices();
  }, []);

  const cardData = [
    {
      title: "회원 수",
      value: stats.users,
      path: "/admin/users",
      icon: <PersonIcon />,
      color: "#4caf50",
    },
    {
      title: "업체 수",
      value: stats.partners,
      path: "/admin/partners",
      icon: <ApartmentIcon />,
      color: "#2196f3",
    },
    {
      title: "거래 건수",
      value: stats.transactions,
      path: "/admin/rentals",
      icon: <SwapHorizIcon />,
      color: "#ff9800",
    },
    {
      title: "총 수익",
      value: stats.revenue.toLocaleString() + "원",
      path: "/admin/statistics",
      icon: <AttachMoneyIcon />,
      color: "#f44336",
      noArrow: true,
    },
  ];

  const examplePosts = [
    { title: "서버 점검 안내" },
    { title: "신규 기능 출시" },
    { title: "이벤트 진행중" },
  ];

  const exampleInquiries = [
    { title: "상품 대여 문의" },
    { title: "환불 관련 질문" },
    { title: "배송 지연 관련" },
  ];

  const topPartners = [
    { name: "업체1", percent: 40 },
    { name: "업체2", percent: 25 },
    { name: "업체3", percent: 15 },
  ];

  const topCategories = [
    { name: "카메라", percent: 35 },
    { name: "드론", percent: 25 },
    { name: "조명", percent: 20 },
    { name: "기타", percent: 20 },
  ];

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={5} px={4} sx={{ backgroundColor: "#f4f6f8", minHeight: "100vh" }}>
        <Header>
          <Grid container spacing={3}>
            {cardData.map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card sx={{ position: "relative" }}>
                  {!stat.noArrow && (
                    <Link to={stat.path} style={{ textDecoration: "none" }}>
                      <ArrowForwardIcon
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          color: "#1976d2",
                          cursor: "pointer",
                        }}
                      />
                    </Link>
                  )}
                  <CardContent>
                    <Box display="flex" alignItems="center">
                      <Box
                        sx={{
                          backgroundColor: stat.color,
                          borderRadius: 2,
                          width: 50,
                          height: 50,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: 2,
                          color: "#fff",
                        }}
                      >
                        {stat.icon}
                      </Box>
                      <Box>
                        <Typography variant="h6">{stat.title}</Typography>
                        <Typography color="textSecondary">{stat.value}</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* 공지사항 & 문의사항 */}
          <Grid container spacing={3} mb={4} sx={{ mt: { xs: 4, md: 0 } }}>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 3, minHeight: 300 }}>
                <MDTypography variant="subtitle1" mb={2}>
                  📌 공지사항
                </MDTypography>
                {notices.length === 0 && <MDTypography>공지사항이 없습니다.</MDTypography>}
                {notices.map((post) => (
                  <Box
                    key={post.id}
                    sx={{
                      mb: 2,
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: "#f9f9f9",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                      cursor: "pointer",
                      transition: "background-color 0.2s, transform 0.2s",
                      "&:hover": {
                        backgroundColor: "#e0f7fa",
                        transform: "translateY(-2px)",
                      },
                    }}
                    onClick={() => (window.location.href = `/notice/${post.id}`)}
                  >
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{ fontSize: 12, mb: 0.5 }}
                    >
                      #{post.id}
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {post.title}
                    </Typography>
                  </Box>
                ))}
                <MDBox mt={2} sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Link to="/notice" style={{ textDecoration: "none", color: "#1976d2" }}>
                    자세히 보기 →
                  </Link>
                  <Link to="/admin/notice/new" style={{ textDecoration: "none", color: "#1976d2" }}>
                    글쓰기
                  </Link>
                </MDBox>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ p: 3, minHeight: 300 }}>
                <MDTypography variant="subtitle1" mb={2}>
                  ❓ 문의사항 (미답변 N개)
                </MDTypography>

                {exampleInquiries.length === 0 && (
                  <MDTypography sx={{ mb: 1 }}>문의사항이 없습니다.</MDTypography>
                )}

                {exampleInquiries.map((inq) => (
                  <CardContent
                    key={inq.id || inq.title}
                    sx={{
                      mb: 2,
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: "#f9f9f9",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                      cursor: "pointer",
                      transition: "background-color 0.2s, transform 0.2s",
                      "&:hover": {
                        backgroundColor: "#fff3e0",
                        transform: "translateY(-2px)",
                      },
                    }}
                    onClick={() => (window.location.href = `/inquiries/${inq.id || ""}`)}
                  >
                    <MDTypography
                      variant="body2"
                      color="textSecondary"
                      sx={{ fontSize: 12, mb: 0.5 }}
                    >
                      작성자{inq.id ? `#${inq.id}` : ""}
                    </MDTypography>
                    <MDTypography variant="body1" sx={{ fontWeight: 500 }}>
                      {inq.title}
                    </MDTypography>
                  </CardContent>
                ))}

                <MDBox mt={2} sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Link to="/admin/inquiries" style={{ textDecoration: "none", color: "#1976d2" }}>
                    자세히 보기 →
                  </Link>
                </MDBox>
              </Card>
            </Grid>
          </Grid>
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 3, height: 300 }}>
                <MDTypography variant="subtitle1" mb={2}>
                  📈 총 수익 추이 그래프
                </MDTypography>
                <ResponsiveContainer width="100%" height="80%">
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 3, height: 300 }}>
                <MDTypography variant="subtitle1" mb={2}>
                  👥 회원 수 추이 그래프
                </MDTypography>
                <ResponsiveContainer width="100%" height="80%">
                  <LineChart data={usersData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="totalUsers" stroke="#82ca9d" />
                    <Line type="monotone" dataKey="newUsers" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Grid>
          </Grid>

          {/* 분석 영역 - Top 업체, 카테고리 */}
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 3 }}>
                <MDTypography variant="subtitle1" mb={2}>
                  🏆 업체별 수익 TOP
                </MDTypography>
                {topPartners.map((p, idx) => (
                  <MDTypography key={idx} sx={{ mb: 1 }}>
                    {p.name} ━━━ {p.percent}%
                  </MDTypography>
                ))}
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 3 }}>
                <MDTypography variant="subtitle1" mb={2}>
                  📊 인기 상품 카테고리
                </MDTypography>
                {topCategories.map((c, idx) => (
                  <MDTypography key={idx} sx={{ mb: 1 }}>
                    {c.name} ━━━ {c.percent}%
                  </MDTypography>
                ))}
              </Card>
            </Grid>
          </Grid>

          {/* 관리자 기능 목록 (하단) */}
          <MDTypography variant="h4" mb={3} fontWeight="bold" textAlign="center">
            🛠️ 관리자 기능 목록
          </MDTypography>
          <Grid container spacing={4} justifyContent="center">
            {adminMenus.map(({ title, icon, path }) => (
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
                      background: "linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)",
                      color: "#00796b",
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
        </Header>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default AdminDashboard;
