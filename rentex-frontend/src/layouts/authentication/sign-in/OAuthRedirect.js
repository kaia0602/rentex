// OAuthRedirectPage.js

import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useAuth } from "contexts/AuthContext";
import { setToken } from "utils/auth";
import MDBox from "components/MDBox";
import CircularProgress from "@mui/material/CircularProgress";
import api from "api/client";

function OAuthRedirectPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth(); // login 함수를 가져옵니다.

  useEffect(() => {
    const accessToken = searchParams.get("token");

    if (accessToken) {
      // 1. 토큰을 localStorage에 저장하여 로그인 상태를 유지합니다.
      setToken(accessToken);

      // 2. 앞으로의 API 요청을 위해 axios 인스턴스에도 바로 헤더를 설정해줍니다.
      api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

      // 3. (수정) 현재 앱의 상태를 '로그인'으로 변경하고 토큰을 전달합니다.
      login(accessToken); // ✅ login 함수에 accessToken을 인자로 전달합니다.

      // 4. 모든 처리가 끝났으면 대시보드로 이동합니다.
      navigate("/dashboard");
    } else {
      console.error("소셜 로그인 토큰이 URL에 없습니다.");
      alert("로그인에 실패했습니다. 로그인 페이지로 돌아갑니다.");
      navigate("/authentication/sign-in");
    }
  }, [searchParams, navigate, login]); // 의존성 배열에 login 함수를 추가합니다.

  return (
    <MDBox display="flex" justifyContent="center" alignItems="center" height="100vh">
      <CircularProgress />
    </MDBox>
  );
}

export default OAuthRedirectPage;
