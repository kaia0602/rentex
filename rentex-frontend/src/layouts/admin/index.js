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
  PieChart,
  Pie,
  Cell,
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
import Footer from "layouts/authentication/components/Footer";

import Header from "layouts/admin/components/Header";
import { CardContent, Typography } from "@mui/material";
import { Box } from "@mui/system";

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
  const [inquiries, setInquiries] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [userData, setUserData] = useState([]);
  const [partners, setPartners] = useState([]);
  const [topCategories, setTopCategories] = useState([]);
  const unansweredCount = inquiries.filter((inq) => !inq.answerContent).length;
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA336A", "#8884d8"];
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

    const fetchInquiries = async () => {
      try {
        const res = await api.get("/qna", { params: { page: 0, size: 3 } });
        setInquiries(res.data.content || []);
      } catch (error) {
        console.error("문의사항 조회 실패:", error);
      }
    };

    const fetchRevenue = async () => {
      try {
        const res = await api.get("admin/statistics/monthly-revenue", {
          params: { fromYear: 2025, fromMonth: 1, toYear: 2025, toMonth: 12 },
        });

        console.log("백엔드 응답 데이터:", res.data);

        // 응답 예: [{ month: "2025-07", revenue: 100000 }, { month: "2025-08", revenue: 200000 }]
        const apiData = res.data;

        // 1~12월 기본 배열
        const months = Array.from({ length: 12 }, (_, i) => ({
          month: `${i + 1}월`,
          revenue: 0,
        }));

        // 응답 매핑
        apiData.forEach((d) => {
          const [year, month] = d.month.split("-");
          const monthIndex = parseInt(month, 10) - 1; // 0부터 시작
          months[monthIndex].revenue = d.revenue;
        });
        // res.data: [{ month: "2024-01", revenue: 100000 }, ...]
        setRevenueData(months);
      } catch (err) {
        console.error("월별 수익 조회 실패", err);
      }
    };

    const fetchMonthlyUsers = async () => {
      try {
        const res = await api.get("/admin/users/monthly-users", { params: { year: 2025 } });
        const apiData = res.data; // [{ month: "2025-01", newUsers: 10 }, ... ]

        console.log("백엔드 응답 데이터:", res.data);

        // 1~12월 기본 배열
        const months = Array.from({ length: 12 }, (_, i) => ({
          month: `${i + 1}월`,
          newUsers: 0,
        }));

        apiData.forEach((d) => {
          const monthIndex = parseInt(d.month.replace("월", ""), 10) - 1; // "8월" → 8 → index 7
          months[monthIndex].newUsers = d.newUsers;
        });

        // 전체 회원 수 계산 (누적 합)
        let cumulative = 0;
        months.forEach((m) => {
          cumulative += m.newUsers;
          m.totalUsers = cumulative;
        });

        setUserData(months);
      } catch (err) {
        console.error("월별 신규 회원 조회 실패", err);
      }
    };

    const fetchPartnerRevenues = async () => {
      try {
        const res = await api.get("/admin/statistics/partner-revenues", {
          params: {
            from: "2025-01-01",
            to: "2025-12-31",
          },
        });
        // DTO: { partnerId, partnerName, totalRevenue }
        setPartners(res.data);
      } catch (err) {
        console.error("파트너별 수익 조회 실패", err);
      }
    };
    const fetchTopCategories = async () => {
      try {
        const res = await api.get("/categories/subcategories/revenue");
        console.log("topCategories:", res.data);
        setTopCategories(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchStats();
    fetchNotices();
    fetchInquiries();
    fetchRevenue();
    fetchMonthlyUsers();
    fetchPartnerRevenues();
    fetchTopCategories();
  }, []);

  const top3 = [...partners].sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 3);

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
                {notices.length === 0 && <MDTypography>현재 공지사항이 없습니다!</MDTypography>}
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
                  ❓ 문의사항 (미답변 {unansweredCount}개)
                </MDTypography>

                {inquiries.length === 0 && (
                  <MDTypography sx={{ mb: 1 }}>현재 문의사항이 없습니다!</MDTypography>
                )}

                {inquiries.map((inq) => (
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
                    onClick={() => (window.location.href = `/admin/inquiries/${inq.id || ""}`)}
                  >
                    <MDTypography
                      variant="body2"
                      color="textSecondary"
                      sx={{ fontSize: 12, mb: 0.5 }}
                    >
                      작성자 : {inq.authorNickname}
                    </MDTypography>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <MDTypography variant="body1" sx={{ fontWeight: 500 }}>
                        {inq.title}
                      </MDTypography>
                      <MDTypography
                        variant="caption"
                        color={inq.answerContent ? "success.main" : "error.main"}
                        fontWeight="bold"
                      >
                        {inq.answerContent ? "답변완료" : "미답변"}
                      </MDTypography>
                    </Box>
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
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value) => `${value.toLocaleString()}원`} />
                    <Legend />
                    <Line dataKey="revenue" name="관리자 수익" stroke="#8884d8" />
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
                  <LineChart data={userData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, (dataMax) => dataMax + 10]} />
                    <Tooltip />
                    <Legend />
                    <Line type="linear" dataKey="newUsers" stroke="#8884d8" name="신규 회원" />
                    <Line type="linear" dataKey="totalUsers" stroke="#82ca9d" name="전체 회원" />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Grid>
          </Grid>

          {/* 분석 영역 - Top 업체, 카테고리 */}
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 3, height: 350 }}>
                <MDTypography variant="subtitle1" mb={2}>
                  🏬 업체별 수익 분석
                </MDTypography>

                <Grid container spacing={2}>
                  {/* 왼쪽 - 파이차트 */}
                  <Grid item xs={6}>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={partners}
                          dataKey="totalRevenue"
                          nameKey="partnerName"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          innerRadius={30}
                          labelLine={false}
                          label={({
                            cx,
                            cy,
                            midAngle,
                            innerRadius,
                            outerRadius,
                            percent,
                            index,
                          }) => {
                            const radius = innerRadius + (outerRadius - innerRadius) / 2;
                            const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                            const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                            return (
                              <text
                                x={x}
                                y={y}
                                fill="#000"
                                textAnchor="middle"
                                dominantBaseline="central"
                                fontSize={10}
                              >
                                {`${partners[index].partnerName} ${(percent * 100).toFixed(0)}%`}
                              </text>
                            );
                          }}
                        >
                          {partners.map((_, index) => (
                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value.toLocaleString()}원`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Grid>

                  {/* 오른쪽 - Top3 리스트 */}
                  <Grid item xs={6}>
                    <MDTypography variant="subtitle2" mb={1}>
                      🏆 Top 3
                    </MDTypography>
                    {top3.map((p, idx) => (
                      <MDTypography
                        key={idx}
                        sx={{
                          mb: 1,
                          fontSize: "1.25rem",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                        title={`${p.partnerName} ━━━ ${p.totalRevenue.toLocaleString()}원`}
                      >
                        {idx + 1}. {p.partnerName} ━━━ {p.totalRevenue.toLocaleString()}원
                      </MDTypography>
                    ))}
                  </Grid>
                </Grid>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ p: 3, height: 350, display: "flex", flexDirection: "column" }}>
                <MDTypography variant="subtitle1" mb={2}>
                  📊 인기 상품 카테고리
                </MDTypography>

                <Grid container spacing={2}>
                  {/* 왼쪽 - PieChart */}
                  <Grid item xs={6}>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={topCategories
                            .sort((a, b) => b.rentalCount - a.rentalCount)
                            .slice(0, 5)}
                          dataKey="rentalCount"
                          nameKey="subCategoryName"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          innerRadius={30}
                          labelLine={false}
                          label={({
                            cx,
                            cy,
                            midAngle,
                            innerRadius,
                            outerRadius,
                            percent,
                            index,
                          }) => {
                            const radius = innerRadius + (outerRadius - innerRadius) / 2;
                            const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                            const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                            return (
                              <text
                                x={x}
                                y={y}
                                fill="#000"
                                textAnchor="middle"
                                dominantBaseline="central"
                                fontSize={10}
                              >
                                {`${topCategories[index].subCategoryName} ${(percent * 100).toFixed(
                                  0,
                                )}%`}
                              </text>
                            );
                          }}
                        >
                          {topCategories.map((_, index) => (
                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value}건`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Grid>

                  {/* 오른쪽 - Top3 리스트 */}
                  <Grid item xs={6}>
                    <MDTypography variant="subtitle2" mb={1}>
                      🏆 Top 3
                    </MDTypography>
                    {topCategories
                      .sort((a, b) => b.rentalCount - a.rentalCount)
                      .slice(0, 3)
                      .map((c, idx) => (
                        <MDTypography
                          key={idx}
                          sx={{
                            mb: 1,
                            fontSize: "1.25rem",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                          title={`${c.subCategoryName} ━━━ ${c.rentalCount}건`}
                        >
                          {idx + 1}. {c.subCategoryName} ━━━ {c.rentalCount}건
                        </MDTypography>
                      ))}
                  </Grid>
                </Grid>
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
