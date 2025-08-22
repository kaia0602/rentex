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
          py: 6,
          px: 2,
        }}
      >
        <Grid container spacing={3} alignItems="center"></Grid>
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
