import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function OAuthRedirect() {
  const nav = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);
      alert("로그인 성공!");
      nav("/"); // 로그인 후 이동할 경로
    } else {
      nav("/authentication/sign-in");
    }
  }, [nav]);

  return <div>로그인 처리 중...</div>;
}

export default OAuthRedirect;
