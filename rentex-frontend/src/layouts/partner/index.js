// @mui material components
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";

// @mui icons
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ProfileInfoCard from "examples/Cards/InfoCards/ProfileInfoCard";
import ProfilesList from "examples/Lists/ProfilesList";
import DefaultProjectCard from "examples/Cards/ProjectCards/DefaultProjectCard";

// Overview page components
import Header from "layouts/partner/components/Header";
import PlatformSettings from "layouts/profile/components/PlatformSettings";

// Data
import profilesListData from "layouts/profile/data/profilesListData";

// Images
import homeDecor1 from "assets/images/home-decor-1.jpg";
import homeDecor2 from "assets/images/home-decor-2.jpg";
import homeDecor3 from "assets/images/home-decor-3.jpg";
import homeDecor4 from "assets/images/home-decor-4.jpeg";
import team1 from "assets/images/team-1.jpg";
import team2 from "assets/images/team-2.jpg";
import team3 from "assets/images/team-3.jpg";
import team4 from "assets/images/team-4.jpg";

import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import { Link } from "react-router-dom";

import React, { useEffect, useState } from "react";
import api from "api/client"; // axios 인스턴스

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
      <MDBox mb={2} />
      <Header>
        <MDBox mt={5} mb={3}>
          <Grid container spacing={1}>
            <Grid item xs={12} md={6} xl={4}>
              <Card sx={{ p: 3 }}>
                <MDTypography variant="subtitle1" color="text">
                  등록 장비
                </MDTypography>
                <MDTypography variant="h5" fontWeight="bold">
                  {itemCount}개
                </MDTypography>
              </Card>
            </Grid>
            <Grid item xs={12} md={6} xl={4} sx={{ display: "flex" }}>
              <Divider orientation="vertical" sx={{ ml: -2, mr: 1 }} />
              <ProfileInfoCard
                title="profile information"
                description="Hi, I’m Alec Thompson, Decisions: If you can’t decide, the answer is no. If two equally difficult paths, choose the one more painful in the short term (pain avoidance is creating an illusion of equality)."
                info={{
                  fullName: "Alec M. Thompson",
                  mobile: "(44) 123 1234 123",
                  email: "alecthompson@mail.com",
                  location: "USA",
                }}
                social={[
                  {
                    link: "https://www.facebook.com/CreativeTim/",
                    icon: <FacebookIcon />,
                    color: "facebook",
                  },
                  {
                    link: "https://twitter.com/creativetim",
                    icon: <TwitterIcon />,
                    color: "twitter",
                  },
                  {
                    link: "https://www.instagram.com/creativetimofficial/",
                    icon: <InstagramIcon />,
                    color: "instagram",
                  },
                ]}
                action={{ route: "", tooltip: "Edit Profile" }}
                shadow={false}
              />
              <Divider orientation="vertical" sx={{ mx: 0 }} />
            </Grid>
            <Grid item xs={12} xl={4}>
              <ProfilesList title="conversations" profiles={profilesListData} shadow={false} />
            </Grid>
          </Grid>
        </MDBox>
        <MDBox pt={2} px={2} lineHeight={1.25}>
          <MDTypography variant="h6" fontWeight="medium">
            Projects
          </MDTypography>
          <MDBox mb={1}>
            <MDTypography variant="button" color="text">
              Architects design houses
            </MDTypography>
          </MDBox>
        </MDBox>

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
      </Header>
      <Footer />
    </DashboardLayout>
  );
}

export default Overview;
