/**
 =========================================================
 * Material Dashboard 2 React - v2.2.0
 =========================================================
 */

import PropTypes from "prop-types";
import Grid from "@mui/material/Grid";
import MDBox from "components/MDBox";
import PageLayout from "examples/LayoutContainers/PageLayout";
import Footer from "layouts/authentication/components/Footer";

import rentexLogo from "assets/images/logos/rentex.png";

function CoverLayout({ coverHeight, image, children }) {
  return (
    <PageLayout>
      <MDBox
        display="flex"
        flexDirection="column"
        minHeight="100vh"
        width="100%"
        position="relative" // 자식 요소의 absolute 위치 기준
      >
        {/* 배경 이미지 */}
        <MDBox
          position="absolute"
          width="100%"
          height="100%"
          sx={{
            backgroundImage: ({ functions: { linearGradient, rgba }, palette: { gradients } }) =>
              image &&
              `${linearGradient(
                rgba(gradients.dark.main, 0.4),
                rgba(gradients.dark.state, 0.4),
              )}, url(${image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />

        <MDBox component="header" textAlign="center" pt={6} pb={3}>
          <img src={rentexLogo} alt="우리 회사 로고" style={{ width: "250px" }} />
        </MDBox>

        <MDBox
          component="main"
          display="flex"
          alignItems="center"
          justifyContent="center"
          sx={{ flexGrow: 1 }}
        >
          <Grid container justifyContent="center">
            <Grid item xs={11} sm={9} md={5} lg={4} xl={3}>
              {children}
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>
      <MDBox component="footer" pb={3}>
        <Footer />
      </MDBox>
    </PageLayout>
  );
}

CoverLayout.defaultProps = {
  coverHeight: "35vh",
};

CoverLayout.propTypes = {
  coverHeight: PropTypes.string,
  image: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default CoverLayout;
