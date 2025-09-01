import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "context/AuthContext";

function OAuthRedirect() {
  const nav = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");

    if (!accessToken) {
      nav("/authentication/sign-in", { replace: true });
      return;
    }

    // 토큰 저장
    login(accessToken, refreshToken);

    // 로그인 성공 후 이동할 경로
    nav("/mypage", { replace: true });
  }, [nav, login]);

  return <div>로그인 처리 중...</div>;
}

export default OAuthRedirect;
