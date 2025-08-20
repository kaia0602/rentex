import { useState, useEffect } from "react";
import api from "api/client";
import { getToken } from "utils/auth";
import BusinessIcon from "@mui/icons-material/Business";
import PropTypes from "prop-types";

// @mui material components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Avatar from "@mui/material/Avatar";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Material Dashboard 2 React base styles
import breakpoints from "assets/theme/base/breakpoints";

// Images
import backgroundImage from "assets/images/bg-profile.jpeg";

function Header({ children }) {
  const [user, setUser] = useState("");

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    api
      .get("/users/me")
      .then((res) => {
        console.log("사용자 데이터:", res.data);
        setUser(res.data);
      })
      .catch((err) => {
        console.error("사용자 정보 불러오기 실패:", err);
      });
  }, []);

  return (
    <MDBox position="relative" mb={5}>
      <MDBox
        display="flex"
        alignItems="center"
        position="relative"
        minHeight="18.75rem"
        borderRadius="xl"
        sx={{
          backgroundImage: ({ functions: { rgba, linearGradient }, palette: { gradients } }) =>
            `${linearGradient(
              rgba(gradients.info.main, 0.6),
              rgba(gradients.info.state, 0.6),
            )}, url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "50%",
          overflow: "hidden",
        }}
      />
      <Card
        sx={{
          position: "relative",
          mt: -8,
          mx: 3,
          py: 2,
          px: 2,
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <Avatar sx={{ bgcolor: "#2E3B55", width: 80, height: 80 }}>
              <BusinessIcon fontSize="large" />
            </Avatar>
          </Grid>
          <Grid item>
            {user && (
              <MDBox height="100%" mt={0.5} lineHeight={1}>
                <MDTypography variant="h5" fontWeight="medium">
                  {user.name}
                </MDTypography>
                <MDTypography variant="button" color="text" fontWeight="regular">
                  {user.businessNo}
                </MDTypography>
              </MDBox>
            )}
          </Grid>
          <Grid item xs={12} md={6} lg={4} sx={{ ml: "auto" }}>
            <MDBox display="flex" justifyContent="flex-end" alignItems="center">
              <MDButton variant="outlined" color="info" size="small" href="/mypage/edit">
                정보 수정
              </MDButton>
            </MDBox>
          </Grid>
        </Grid>
        {children}
      </Card>
    </MDBox>
  );
}

Header.defaultProps = {
  children: "",
};

Header.propTypes = {
  children: PropTypes.node,
};

export default Header;
