import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "context/AuthContext";

function OAuthRedirect() {
  const nav = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      nav("/authentication/sign-in", { replace: true });
      return;
    }

    // 1) 토큰 저장 + isLoggedIn true (→ AuthProvider가 /users/me 자동 호출)
    login(token);

    // 2) 로그인 페이지로 되돌아가면서 성공 state 전달
    nav("/authentication/sign-in", {
      replace: true,
      state: { oauthSuccess: true },
    });
  }, [nav, login]);

  return <div>로그인 처리 중...</div>;
}

export default OAuthRedirect;
