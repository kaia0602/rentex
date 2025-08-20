import PropTypes from "prop-types";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDAvatar from "components/MDAvatar";
import MDButton from "components/MDButton";

import burceMars from "assets/images/bruce-mars.jpg";
import backgroundImage from "assets/images/bg-profile.jpeg";

function UserHeader({ children }) {
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
            <MDAvatar src={burceMars} alt="profile-image" size="xl" shadow="sm" />
          </Grid>
          <Grid item>
            <MDBox height="100%" mt={0.5} lineHeight={1}>
              <MDTypography variant="h5" fontWeight="medium">
                홍길동
              </MDTypography>
              <MDTypography variant="button" color="text" fontWeight="regular">
                일반 회원
              </MDTypography>
            </MDBox>
          </Grid>
          {/* ✅ 여기 버튼 영역만 수정 */}
          <Grid item xs={12} md={6} lg={4} sx={{ ml: "auto" }}>
            <MDBox display="flex" justifyContent="flex-end" alignItems="center">
              <MDButton variant="outlined" color="info" size="small" href="/mypage/edit">
                회원정보 수정
              </MDButton>
            </MDBox>
          </Grid>
        </Grid>
        {children}
      </Card>
    </MDBox>
  );
}

UserHeader.defaultProps = {
  children: "",
};

UserHeader.propTypes = {
  children: PropTypes.node,
};

export default UserHeader;
