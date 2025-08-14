import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Card from "@mui/material/Card";
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
import bgImage from "assets/images/bg-sign-in-basic.jpeg";
import NaverIcon from "assets/images/icons/NaverIcon";
import api from "api/client";

function Basic() {
  const nav = useNavigate();
  const [rememberMe, setRememberMe] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const [loginFailed, setLoginFailed] = useState(false);

  const [viewMode, setViewMode] = useState("login");

  const handleSetRememberMe = () => setRememberMe(!rememberMe);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setLoginFailed(false);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // ✅ 1. API 주소를 '/api/auth/login'으로 수정
      const res = await api.post("/api/auth/login", {
        email: form.email,
        password: form.password,
      });

      // ✅ 2. 응답 '헤더'에서 'authorization' 값을 가져오도록 수정
      const token = res.headers["authorization"];

      if (token) {
        localStorage.setItem("accessToken", token);
        alert("로그인 성공!");
        nav("/dashboard"); // 성공 시 대시보드로 이동
      } else {
        alert("로그인 실패: 응답에 토큰이 없습니다.");
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "이메일 또는 비밀번호가 올바르지 않습니다.";
      alert(msg);
      setLoginFailed(true);
    } finally {
      setLoading(false); // ✅ 성공/실패와 관계없이 로딩 상태 해제
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
            {/* ✅ viewMode에 따라 제목도 변경해 줍니다. */}
            {viewMode === "login" ? "Sign in" : "비밀번호 재설정"}
          </MDTypography>

          {/* 소셜 로그인 아이콘은 로그인 화면에만 표시 */}
          {viewMode === "login" && (
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
          )}
        </MDBox>

        <MDBox pt={4} pb={3} px={3}>
          {viewMode === "login" ? (
            // ===================================
            // ✅ 1. 'login' 뷰
            // ===================================
            <>
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

                {loginFailed && (
                  <MDBox mb={2} textAlign="right">
                    <MDTypography variant="button" color="text">
                      비밀번호를 잊어버리셨나요?{" "}
                      <MDTypography
                        component="a"
                        onClick={() => setViewMode("passwordReset")}
                        variant="button"
                        color="info"
                        fontWeight="medium"
                        textGradient
                        sx={{ cursor: "pointer" }}
                      >
                        비밀번호 변경하기
                      </MDTypography>
                    </MDTypography>
                  </MDBox>
                )}

                <MDBox mt={4} mb={1}>
                  <MDButton
                    type="submit"
                    variant="gradient"
                    color="info"
                    fullWidth
                    disabled={loading}
                  >
                    {loading ? "처리 중..." : "SIGN IN"}
                  </MDButton>
                </MDBox>
              </MDBox>

              {/* 소셜 로그인 버튼 */}
              <MDBox mt={2}>
                <MDButton
                  variant="outlined"
                  color="info"
                  fullWidth
                  onClick={() => {
                    window.location.href = "http://localhost:8080/oauth2/authorization/google";
                  }}
                >
                  <GoogleIcon sx={{ mr: 1 }} /> Google로 로그인
                </MDButton>
                <MDBox mt={2}>
                  <MDButton
                    variant="outlined"
                    color="info"
                    fullWidth
                    onClick={() => {
                      window.location.href = "http://localhost:8080/oauth2/authorization/naver";
                    }}
                  >
                    <NaverIcon sx={{ mr: 1 }} /> Naver로 로그인
                  </MDButton>
                </MDBox>
              </MDBox>

              {/* 회원가입 링크 */}
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
            </>
          ) : (
            // ===================================
            // ✅ 2. 'passwordReset' 뷰
            // ===================================
            <MDBox
              component="form"
              role="form"
              onSubmit={(e) => {
                /* 비밀번호 재설정 API 호출 로직 */
              }}
            >
              <MDBox mb={2}>
                <MDInput type="email" label="가입한 이메일" fullWidth />
              </MDBox>
              <MDBox mt={4} mb={1}>
                <MDButton type="submit" variant="gradient" color="info" fullWidth>
                  인증 코드 발송
                </MDButton>
              </MDBox>
              <MDBox mt={3} mb={1} textAlign="center">
                <MDTypography
                  component="a"
                  onClick={() => setViewMode("login")}
                  variant="button"
                  color="info"
                  fontWeight="medium"
                  sx={{ cursor: "pointer" }}
                >
                  로그인 화면으로 돌아가기
                </MDTypography>
              </MDBox>
            </MDBox>
          )}
        </MDBox>
      </Card>
    </BasicLayout>
  );
}

export default Basic;
