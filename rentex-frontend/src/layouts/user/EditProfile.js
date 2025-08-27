import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "layouts/authentication/components/Footer";

// MUI
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";

// Components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Custom Cards
import ProfileInfoCard from "examples/Cards/InfoCards/ProfileInfoCard";
import PlatformSettings from "layouts/profile/components/PlatformSettings";

// Icons
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";

// useState
import { useState } from "react";

function EditProfile() {
  const [form, setForm] = useState({
    name: "홍길동",
    nickname: "길동이",
    phone: "010-1234-5678",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    alert("회원 정보가 수정되었습니다 (가상 처리)");
    // TODO: 실제 API 연동
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mt={4} mb={3}>
        <Grid container spacing={3}>
          {/* 왼쪽: 설정 */}
          <Grid item xs={12} md={6} xl={4}>
            <PlatformSettings />
          </Grid>

          {/* 중앙: 프로필 카드 */}
          <Grid item xs={12} md={6} xl={4} sx={{ display: "flex" }}>
            <Divider orientation="vertical" sx={{ ml: -2, mr: 1 }} />
            <ProfileInfoCard
              title="회원 정보"
              description="프로필 정보를 확인하고 수정할 수 있습니다."
              info={{
                fullName: form.name,
                nickname: form.nickname,
                phone: form.phone,
              }}
              social={[
                {
                  link: "https://facebook.com",
                  icon: <FacebookIcon />,
                  color: "facebook",
                },
                {
                  link: "https://twitter.com",
                  icon: <TwitterIcon />,
                  color: "twitter",
                },
                {
                  link: "https://instagram.com",
                  icon: <InstagramIcon />,
                  color: "instagram",
                },
              ]}
              action={{ route: "", tooltip: "수정" }}
              shadow={false}
            />
            <Divider orientation="vertical" sx={{ mx: 0 }} />
          </Grid>

          {/* 우측: 수정 폼 */}
          <Grid item xs={12} xl={4}>
            <MDBox display="flex" flexDirection="column" gap={2}>
              <MDTypography variant="h6">회원 정보 수정</MDTypography>
              <MDInput
                label="이름"
                name="name"
                value={form.name}
                onChange={handleChange}
                fullWidth
              />
              <MDInput
                label="닉네임"
                name="nickname"
                value={form.nickname}
                onChange={handleChange}
                fullWidth
              />
              <MDInput
                label="연락처"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                fullWidth
              />
              <MDButton color="info" onClick={handleSubmit}>
                저장하기
              </MDButton>
            </MDBox>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default EditProfile;
