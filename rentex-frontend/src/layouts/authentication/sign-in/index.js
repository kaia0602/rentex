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
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [loginFailed, setLoginFailed] = useState(false);
  const [viewMode, setViewMode] = useState("login");

  const [resetStep, setResetStep] = useState("enterEmail");
  const [resetForm, setResetForm] = useState({
    email: "",
    code: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [resetError, setResetError] = useState("");

  const handleSetRememberMe = () => setRememberMe(!rememberMe);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setLoginFailed(false);
  };

  const onResetFormChange = (e) => {
    const { name, value } = e.target;
    setResetForm((prev) => ({ ...prev, [name]: value }));
    setResetError("");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.post("/api/auth/login", { email: form.email, password: form.password });
      const authHeader = res.headers["authorization"];

      if (authHeader && authHeader.startsWith("Bearer ")) {
        // "Bearer " 접두사를 제거하고 순수한 토큰만 추출합니다.
        const token = authHeader.substring(7);
        localStorage.setItem("accessToken", token);
        alert("로그인 성공!");
        nav("/dashboard");
      } else {
        alert("로그인 실패: 응답에 유효한 토큰이 없습니다.");
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "이메일 또는 비밀번호가 올바르지 않습니다.";
      alert(msg);
      setLoginFailed(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSendCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResetError("");
    try {
      await api.post("/api/auth/password-reset/request", { email: resetForm.email });
      alert("인증 코드가 이메일로 발송되었습니다.");
      setResetStep("enterCodeAndPassword");
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "이메일 발송에 실패했습니다. 가입된 이메일인지 확인해주세요.";
      setResetError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndReset = async (e) => {
    e.preventDefault();
    if (resetForm.newPassword !== resetForm.confirmPassword) {
      setResetError("새 비밀번호가 일치하지 않습니다.");
      return;
    }
    setLoading(true);
    setResetError("");
    try {
      await api.post("/api/auth/password-reset/verify", {
        email: resetForm.email,
        code: resetForm.code,
        newPassword: resetForm.newPassword,
      });
      alert("비밀번호가 성공적으로 변경되었습니다. 새 비밀번호로 로그인하세요.");
      setViewMode("login");
      setResetStep("enterEmail");
      setResetForm({ email: "", code: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      const msg =
        err.response?.data?.body || "비밀번호 변경에 실패했습니다. 인증 코드를 확인해주세요.";
      setResetError(msg);
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
            {viewMode === "login" ? "Sign in" : "비밀번호 재설정"}
          </MDTypography>
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
            <>
              {resetStep === "enterEmail" && (
                <MDBox component="form" role="form" onSubmit={handleSendCode}>
                  <MDBox mb={2}>
                    <MDInput
                      type="email"
                      label="가입한 이메일"
                      name="email"
                      value={resetForm.email}
                      onChange={onResetFormChange}
                      fullWidth
                    />
                  </MDBox>
                  <MDBox mt={4} mb={1}>
                    <MDButton
                      type="submit"
                      variant="gradient"
                      color="info"
                      fullWidth
                      disabled={loading}
                    >
                      {loading ? "전송 중..." : "인증 코드 발송"}
                    </MDButton>
                  </MDBox>
                </MDBox>
              )}

              {resetStep === "enterCodeAndPassword" && (
                <MDBox component="form" role="form" onSubmit={handleVerifyAndReset}>
                  <MDBox mb={2}>
                    <MDInput
                      type="text"
                      label="인증 코드"
                      name="code"
                      value={resetForm.code}
                      onChange={onResetFormChange}
                      fullWidth
                    />
                  </MDBox>
                  <MDBox mb={2}>
                    <MDInput
                      type="password"
                      label="새 비밀번호"
                      name="newPassword"
                      value={resetForm.newPassword}
                      onChange={onResetFormChange}
                      fullWidth
                    />
                  </MDBox>
                  <MDBox mb={2}>
                    <MDInput
                      type="password"
                      label="새 비밀번호 확인"
                      name="confirmPassword"
                      value={resetForm.confirmPassword}
                      onChange={onResetFormChange}
                      fullWidth
                    />
                  </MDBox>
                  <MDBox mt={4} mb={1}>
                    <MDButton
                      type="submit"
                      variant="gradient"
                      color="info"
                      fullWidth
                      disabled={loading}
                    >
                      {loading ? "변경 중..." : "비밀번호 변경 확인"}
                    </MDButton>
                  </MDBox>
                </MDBox>
              )}

              {resetError && (
                <MDBox mt={2} textAlign="center">
                  <MDTypography variant="caption" color="error">
                    {resetError}
                  </MDTypography>
                </MDBox>
              )}

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
            </>
          )}
        </MDBox>
      </Card>
    </BasicLayout>
  );
}

export default Basic;
