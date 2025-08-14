// src/layouts/admin/index.js

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import { Link } from "react-router-dom";

const adminMenus = [
  { title: "대여 관리", icon: "assignment", path: "/admin/rentals" },
  { title: "장비 관리", icon: "build", path: "/admin/items" },
  { title: "업체 관리", icon: "apartment", path: "/admin/partners" },
  { title: "벌점 관리", icon: "gavel", path: "/admin/penalty" },
  { title: "정산 통계", icon: "bar_chart", path: "/admin/statistics" },
];

function AdminDashboard() {
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={5} px={4} sx={{ backgroundColor: "#f4f6f8", minHeight: "100vh" }}>
        <MDTypography variant="h4" mb={4} fontWeight="bold" textAlign="center">
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
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    background: "linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)",
                    color: "#00796b",
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
      <Footer />
    </DashboardLayout>
  );
}

export default AdminDashboard;
