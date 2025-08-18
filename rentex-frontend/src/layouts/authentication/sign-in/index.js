import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Card from "@mui/material/Card";
import Switch from "@mui/material/Switch";
import Grid from "@mui/material/Grid";
import MuiLink from "@mui/material/Link";
import FacebookIcon from "@mui/icons-material/Facebook";
import GitHubIcon from "@mui/icons-material/GitHub";
import GoogleIcon from "@mui/icons-material/Google";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import BasicLayout from "layouts/authentication/components/BasicLayout";
import api from "api/client"; // axios 인스턴스
import { setToken } from "utils/auth"; // ✅ 토큰 저장 유틸
import bgImage from "assets/images/bg-sign-in-basic.jpeg";

function Basic() {
  const nav = useNavigate();
  const [rememberMe, setRememberMe] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSetRememberMe = () => setRememberMe(!rememberMe);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    // ✅ 여기서 form 값 확인
    console.log("login 요청 DTO:", form);

    try {
      setLoading(true);
      const res = await api.post("/auth/login", {
        email: form.email,
        password: form.password,
      });

      // ✅ 응답 필드 우선순위: accessToken → token → 전체 데이터
      const token = res.data?.accessToken || res.data?.token || res.data;
      if (token) {
        setToken(token); // ✅ 통일된 키로 저장
        alert("로그인 성공!");
        nav("/"); // 필요하면 "/dashboard"로 변경
      } else {
        alert("로그인 실패: 토큰이 없습니다.");
      }
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.message ||
        JSON.stringify(err.response?.data) ||
        "로그인 중 오류가 발생했습니다.";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BasicLayout image={bgImage}>
      <Card>
        <MDBox
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="info"
          mx={2}
          mt={-3}
          p={2}
          mb={1}
          textAlign="center"
        >
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            Sign in
          </MDTypography>
          <Grid container spacing={3} justifyContent="center" sx={{ mt: 1, mb: 2 }}>
            <Grid item xs={2}>
              <MDTypography component={MuiLink} href="#" variant="body1" color="white">
                <FacebookIcon color="inherit" />
              </MDTypography>
            </Grid>
            <Grid item xs={2}>
              <MDTypography component={MuiLink} href="#" variant="body1" color="white">
                <GitHubIcon color="inherit" />
              </MDTypography>
            </Grid>
            <Grid item xs={2}>
              <MDTypography component={MuiLink} href="#" variant="body1" color="white">
                <GoogleIcon color="inherit" />
              </MDTypography>
            </Grid>
          </Grid>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form" onSubmit={onSubmit}>
            <MDBox mb={2}>
              <MDInput
                type="email"
                label="Email"
                name="email"
                value={form.email}
                onChange={onChange}
                fullWidth
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="password"
                label="Password"
                name="password"
                value={form.password}
                onChange={onChange}
                fullWidth
              />
            </MDBox>
            <MDBox display="flex" alignItems="center" ml={-1}>
              <Switch checked={rememberMe} onChange={handleSetRememberMe} />
              <MDTypography
                variant="button"
                fontWeight="regular"
                color="text"
                onClick={handleSetRememberMe}
                sx={{ cursor: "pointer", userSelect: "none", ml: -1 }}
              >
                &nbsp;&nbsp;Remember me
              </MDTypography>
            </MDBox>
            <MDBox mt={4} mb={1}>
              <MDButton type="submit" variant="gradient" color="info" fullWidth disabled={loading}>
                {loading ? "처리 중..." : "SIGN IN"}
              </MDButton>
            </MDBox>

            {/* Google OAuth 버튼 */}
            <MDBox mt={2}>
              <MDButton
                variant="outlined"
                color="info"
                fullWidth
                onClick={() => {
                  // API_BASE에서 /api 부분 제거
                  const apiBase = process.env.REACT_APP_API_BASE || "http://localhost:8080/api";
                  const serverBase = apiBase.replace(/\/api$/, "");
                  window.location.href = `${serverBase}/oauth2/authorization/google`;
                }}
              >
                <GoogleIcon sx={{ mr: 1 }} />
                Google로 로그인
              </MDButton>
            </MDBox>

            <MDBox mt={3} mb={1} textAlign="center">
              <MDTypography variant="button" color="text">
                Don&apos;t have an account?{" "}
                <MDTypography
                  component={Link}
                  to="/authentication/sign-up"
                  variant="button"
                  color="info"
                  fontWeight="medium"
                  textGradient
                >
                  Sign up
                </MDTypography>
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </BasicLayout>
  );
}

export default Basic;
