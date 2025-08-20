// src/layouts/authentication/sign-in/index.js

import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";
import GoogleIcon from "@mui/icons-material/Google";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDSnackbar from "components/MDSnackbar";

// Authentication layout components
import BasicLayout from "layouts/authentication/components/BasicLayout";

// Images
import bgImage from "assets/images/bg-sign-in-basic.jpeg";
import NaverIcon from "assets/images/icons/NaverIcon";

// API & Auth utils
import api from "api/client";
import { setToken } from "utils/auth";

// 1. AuthContext에서 useAuth 훅을 가져옵니다.
import { useAuth } from "contexts/AuthContext";

function Basic() {
  // 2. AuthContext의 login 함수를 준비합니다.
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [loginFailed, setLoginFailed] = useState(false);
  const [viewMode, setViewMode] = useState("login");
  const [searchParams] = useSearchParams();
  const [resetStep, setResetStep] = useState("enterEmail");
  const [resetForm, setResetForm] = useState({
    email: "",
    code: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [resetError, setResetError] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    color: "info",
    title: "",
    content: "",
  });

  const closeSnackbar = () => setSnackbar({ ...snackbar, open: false });

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setLoginFailed(false);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/login", {
        email: form.email,
        password: form.password,
      });

      const authHeader = res.headers["authorization"];
      const token = authHeader?.startsWith("Bearer ")
        ? authHeader.substring(7)
        : res.data?.accessToken || res.data?.token || null;

      if (token) {
        setToken(token);
        // 3. 로그인 성공 시 login() 함수를 호출하여 앱 전체에 상태 변경을 알립니다.
        login();

        setSnackbar({
          open: true,
          color: "success",
          title: "로그인 성공",
          content: "환영합니다!",
        });
        setTimeout(() => nav("/dashboard"), 1000);
      } else {
        throw new Error("유효한 토큰이 없습니다.");
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || err.message || "로그인 중 오류가 발생했습니다.";
      setSnackbar({
        open: true,
        color: "error",
        title: "로그인 실패",
        content: msg,
      });
      setLoginFailed(true);
    } finally {
      setLoading(false);
    }
  };

  // ... (비밀번호 재설정 등 나머지 코드는 그대로 유지) ...
  const onResetFormChange = (e) => {
    const { name, value } = e.target;
    setResetForm((prev) => ({ ...prev, [name]: value }));
    setResetError("");
  };

  useEffect(() => {
    if (searchParams.get("verified") === "true") {
      setSnackbar({
        open: true,
        color: "success",
        title: "인증 완료",
        content: "이메일 인증이 성공적으로 완료되었습니다. 이제 로그인할 수 있습니다.",
      });
    }
  }, [searchParams]);

  const handleSendCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResetError("");
    try {
      await api.post("/auth/password-reset/request", { email: resetForm.email });
      setSnackbar({
        open: true,
        color: "success",
        title: "성공",
        content: "인증 코드가 이메일로 발송되었습니다.",
      });
      setResetStep("enterCodeAndPassword");
      setResetForm((prev) => ({
        ...prev,
        code: "",
        newPassword: "",
        confirmPassword: "",
      }));
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
      await api.post("/auth/password-reset/verify", {
        email: resetForm.email,
        code: resetForm.code,
        newPassword: resetForm.newPassword,
      });
      setSnackbar({
        open: true,
        color: "success",
        title: "성공",
        content: "비밀번호가 성공적으로 변경되었습니다. 새 비밀번호로 로그인하세요.",
      });
      setViewMode("login");
      setResetStep("enterEmail");
      setResetForm({ email: "", code: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      const msg = err.response?.data || "비밀번호 변경에 실패했습니다. 인증 코드를 확인해주세요.";
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
            {viewMode === "login" ? "로그인" : "비밀번호 재설정"}
          </MDTypography>
          {viewMode === "login" && (
            <MDTypography display="block" variant="button" color="white" my={1}>
              아이디와 비밀번호를 입력해주세요.
            </MDTypography>
          )}
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          {viewMode === "login" ? (
            <>
              <MDBox component="form" role="form" onSubmit={onSubmit}>
                <MDBox mb={2}>
                  <MDInput
                    type="email"
                    label="이메일"
                    name="email"
                    value={form.email}
                    onChange={onChange}
                    fullWidth
                  />
                </MDBox>
                <MDBox mb={2}>
                  <MDInput
                    type="password"
                    label="비밀번호"
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
                    {loading ? "처리 중..." : "로그인"}
                  </MDButton>
                </MDBox>
              </MDBox>

              <MDBox mt={2}>
                <MDButton
                  variant="outlined"
                  color="info"
                  fullWidth
                  onClick={() => {
                    const apiBase = process.env.REACT_APP_API_BASE || "http://localhost:8080/api";
                    const serverBase = apiBase.replace(/\/api$/, "");
                    window.location.href = `${serverBase}/oauth2/authorization/google`;
                  }}
                >
                  <GoogleIcon sx={{ mr: 1 }} /> Google로 로그인
                </MDButton>
              </MDBox>
              <MDBox mt={2}>
                <MDButton
                  variant="outlined"
                  color="info"
                  fullWidth
                  onClick={() => {
                    const apiBase = process.env.REACT_APP_API_BASE || "http://localhost:8080/api";
                    const serverBase = apiBase.replace(/\/api$/, "");
                    window.location.href = `${serverBase}/oauth2/authorization/naver`;
                  }}
                >
                  <NaverIcon sx={{ mr: 1 }} /> Naver로 로그인
                </MDButton>
              </MDBox>
              <MDBox mt={3} mb={1} textAlign="center">
                <MDTypography variant="button" color="text">
                  계정이 없으신가요?{" "}
                  <MDTypography
                    component={Link}
                    to="/authentication/sign-up"
                    variant="button"
                    color="info"
                    fontWeight="medium"
                    textGradient
                  >
                    회원가입
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
      <MDSnackbar
        color={snackbar.color}
        icon={snackbar.color === "success" ? "check" : "warning"}
        title={snackbar.title}
        content={snackbar.content}
        open={snackbar.open}
        onClose={closeSnackbar}
        close={closeSnackbar}
        bgWhite
      />
    </BasicLayout>
  );
}

export default Basic;
