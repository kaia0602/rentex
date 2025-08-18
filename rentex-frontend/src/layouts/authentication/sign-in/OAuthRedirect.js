import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { setToken } from "utils/auth";

function OAuthRedirect() {
  const nav = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      setToken(token);
      alert("구글 로그인 성공!");

      // ✅ 로그인 성공하면 대시보드로 이동
      nav("/dashboard");
    } else {
      nav("/authentication/sign-in");
    }
  }, [nav]);

  return <div>로그인 처리 중...</div>;
}

export default OAuthRedirect;
