import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDAvatar from "components/MDAvatar";
import MDButton from "components/MDButton";

import backgroundImage from "assets/images/bg-profile.jpeg";
import api from "api/client";

function UserHeader({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    api
      .get("/users/me")
      .then((res) => setUser(res.data))
      .catch((err) => console.error("유저 정보 불러오기 실패:", err));
  }, []);

  // role 변환
  const roleLabel = (role) => {
    switch (role) {
      case "ADMIN":
        return "관리자";
      case "PARTNER":
        return "파트너";
      default:
        return "일반 회원";
    }
  };

  return (
    <MDBox position="relative" mb={5}>
      {/* 상단 배경 */}
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
      {/* 프로필 카드 */}
      <Card sx={{ position: "relative", mt: -8, mx: 3, py: 2, px: 2 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <MDAvatar
              src={user?.profileImageUrl || "https://via.placeholder.com/150"}
              alt="profile-image"
              size="xl"
              shadow="sm"
            />
          </Grid>
          <Grid item>
            <MDBox height="100%" mt={0.5} lineHeight={1}>
              <MDTypography variant="h5" fontWeight="medium">
                {user?.name || "이름 없음"}
              </MDTypography>
              <MDTypography variant="button" color="text" fontWeight="regular">
                {roleLabel(user?.role)}
              </MDTypography>
              {user && (
                <MDTypography variant="caption" color="error" fontWeight="medium">
                  누적 벌점: {user.penaltyPoints}점
                </MDTypography>
              )}
            </MDBox>
          </Grid>
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
