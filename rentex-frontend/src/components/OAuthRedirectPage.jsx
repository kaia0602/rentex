import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

import { useAuth } from "contexts/AuthContext";
import { setToken } from "utils/auth";
import api from "api/client";

import MDBox from "components/MDBox";
import CircularProgress from "@mui/material/CircularProgress";

/**
 * 소셜 로그인(OAuth2) 성공 후, 백엔드로부터 리디렉션되는 페이지입니다.
 * URL에 포함된 토큰을 처리하고 사용자를 메인 페이지로 보냅니다.
 */
function OAuthRedirectPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const accessToken = searchParams.get("token");

    if (accessToken) {
      login(accessToken);
      navigate("/dashboard");
    } else {
      console.error("소셜 로그인 토큰이 URL에 없습니다.");
      alert("로그인에 실패했습니다. 로그인 페이지로 돌아갑니다.");
      navigate("/authentication/sign-in");
    }
  }, [searchParams]);

  return (
    <MDBox display="flex" justifyContent="center" alignItems="center" height="100vh">
      <CircularProgress />
      <MDBox ml={2}>로그인 처리 중입니다...</MDBox>
    </MDBox>
  );
}

export default OAuthRedirectPage;
