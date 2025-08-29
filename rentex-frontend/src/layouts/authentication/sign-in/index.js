import { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";

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
import naverIconUrl from "assets/images/logos/naverIcon.png";

// API & Auth utils
import api from "api/client";
import { useAuth } from "context/AuthContext";

function Basic() {
  const { isLoggedIn, login } = useAuth();
  const nav = useNavigate();
  const location = useLocation();

  const popupRef = useRef(null);

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

  // ▼ 팝업에서 오는 메시지 수신(토큰 전달)
  useEffect(() => {
    const handler = (event) => {
      // 보안: 반드시 본인 origin만 허용
      if (event.origin !== window.location.origin) return;
      if (!event.data || typeof event.data !== "object") return;

      if (event.data.type === "OAUTH_SUCCESS" && event.data.token) {
        login(event.data.token); // → AuthProvider가 /users/me 자동 수화
        if (popupRef.current && !popupRef.current.closed) popupRef.current.close();
        setSnackbar({
          open: true,
          color: "success",
          title: "소셜 로그인 성공",
          content: "환영합니다!",
        });
        setTimeout(() => nav("/dashboard"), 1000);
      } else if (event.data.type === "OAUTH_ERROR") {
        setSnackbar({
          open: true,
          color: "error",
          title: "소셜 로그인 실패",
          content: event.data.message || "인증 중 오류가 발생했습니다.",
        });
        if (popupRef.current && !popupRef.current.closed) popupRef.current.close();
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [login, nav]);

  // 일반 로그인 성공 시 대시보드 이동
  useEffect(() => {
    if (!isLoggedIn) return;
    setSnackbar({ open: true, color: "success", title: "로그인 성공", content: "환영합니다!" });
    const timer = setTimeout(() => nav("/dashboard"), 1000);
    return () => clearTimeout(timer);
  }, [isLoggedIn, nav]);

  const closeSnackbar = () => setSnackbar((prev) => ({ ...prev, open: false }));

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
      const accessToken = authHeader?.startsWith("Bearer ")
        ? authHeader.substring(7)
        : res.data?.accessToken || res.data?.token || null;

      if (accessToken) {
        login(accessToken); // → AuthProvider가 /users/me 자동 수화
      } else {
        throw new Error("서버 응답에서 토큰을 찾을 수 없습니다.");
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

  const onResetFormChange = (e) => {
    const { name, value } = e.target;
    setResetForm((prev) => ({ ...prev, [name]: value }));
    setResetError("");
  };

  // 이메일 인증 완료 스낵바
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

  // 팝업 열기 공통 함수
  const openOAuthPopup = (provider) => {
    const apiBase = process.env.REACT_APP_API_BASE || "http://localhost:8080/api";
    const serverBase = apiBase.replace(/\/api$/, "");

    const width = 520;
    const height = 650;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    popupRef.current = window.open(
      `${serverBase}/oauth2/authorization/${provider}`,
      `oauth_${provider}`,
      `width=${width},height=${height},left=${left},top=${top},resizable=no,scrollbars=yes,status=no`,
    );
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

              {/* Google 로그인 (팝업) */}
              <MDBox mt={2}>
                <MDButton
                  variant="outlined"
                  color="info"
                  fullWidth
                  onClick={() => openOAuthPopup("google")}
                >
                  <GoogleIcon sx={{ mr: 1 }} /> Google로 로그인
                </MDButton>
              </MDBox>

              {/* Naver 로그인 (팝업) */}
              <MDBox mt={2}>
                <MDButton
                  variant="outlined"
                  color="info"
                  fullWidth
                  onClick={() => openOAuthPopup("naver")}
                >
                  <img
                    src={naverIconUrl}
                    alt="Naver"
                    style={{ width: 18, height: 18, marginRight: 8 }}
                  />
                  Naver로 로그인
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
