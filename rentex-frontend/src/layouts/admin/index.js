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
      <MDBox py={3}>
        <MDTypography variant="h4" mb={3}>
          🛠️ 관리자 기능 목록
        </MDTypography>
        <Grid container spacing={2}>
          {adminMenus.map(({ title, icon, path }) => (
            <Grid item xs={12} md={6} lg={4} key={title}>
              <Link to={path} style={{ textDecoration: "none" }}>
                <Card sx={{ p: 3, textAlign: "center", height: "100%" }}>
                  <Icon fontSize="large" color="info">
                    {icon}
                  </Icon>
                  <MDTypography variant="h6" mt={1}>
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
