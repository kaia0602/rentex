import PropTypes from "prop-types";
import { Link } from "react-router-dom";

import Grid from "@mui/material/Grid";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import PageLayout from "examples/LayoutContainers/PageLayout";
import Footer from "layouts/authentication/components/Footer";

function BasicLayout({ image, children }) {
  return (
    <PageLayout>
      {/* 배경 이미지 */}
      <MDBox
        position="fixed"
        width="100%"
        minHeight="100vh"
        sx={{
          backgroundImage: ({ functions: { linearGradient, rgba }, palette: { gradients } }) =>
            image &&
            `${linearGradient(
              rgba(gradients.dark.main, 0.6),
              rgba(gradients.dark.state, 0.6),
            )}, url(${image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* ✨ 1. 페이지 전체를 감싸는 Flexbox 컨테이너 */}
      <MDBox display="flex" flexDirection="column" minHeight="100vh">
        {/* 섹션 1: 로고 */}
        <MDBox
          component="header"
          textAlign="center"
          pt={10}
          pb={3}
          sx={{
            position: "relative",
            zIndex: 10,
          }}
        >
          <Link to="/dashboard" style={{ textDecoration: "none" }}>
            <MDTypography
              variant="h1"
              fontWeight="bold"
              sx={(theme) => ({
                fontSize: "8rem",
                backgroundImage: `linear-gradient(to right, #33556F, ${theme.palette.info.main})`,
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
              })}
            >
              RENTEX
            </MDTypography>
          </Link>
        </MDBox>

        {/* 섹션 2: 메인 콘텐츠 */}
        <MDBox
          component="main"
          display="flex"
          alignItems="center"
          justifyContent="center"
          sx={{ flexGrow: 1 }}
          mb={6}
        >
          <Grid container justifyContent="center">
            <Grid item xs={11} sm={9} md={5} lg={4} xl={3}>
              {children}
            </Grid>
          </Grid>
        </MDBox>

        {/* ✨ 2. 푸터를 Flexbox 컨테이너 안으로 옮겨 오버랩 문제를 해결합니다. */}
        <MDBox
          component="footer"
          sx={(theme) => ({
            backgroundColor: theme.palette.background.default,
          })}
        >
          <Footer />
        </MDBox>
      </MDBox>
    </PageLayout>
  );
}

BasicLayout.propTypes = {
  image: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default BasicLayout;
