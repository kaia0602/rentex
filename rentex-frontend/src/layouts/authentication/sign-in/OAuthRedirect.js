import { useEffect } from "react";
// useNavigate는 더 이상 필요하지 않으므로 삭제하거나 주석 처리합니다.
// import { useNavigate } from "react-router-dom";
import { setToken } from "utils/auth";

function OAuthRedirect() {
  // const nav = useNavigate(); // 이 줄을 삭제합니다.

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      setToken(token);
      alert("소셜 로그인 성공!");

      // [변경] react-router의 nav 대신 window.location.href를 사용해
      // 페이지를 새로고침하며 대시보드로 이동합니다.
      window.location.href = "/dashboard";
    } else {
      // 실패 시에도 일관성을 위해 window.location.href를 사용할 수 있습니다.
      window.location.href = "/authentication/sign-in";
    }
  }, []); // nav가 없어졌으므로 의존성 배열에서 제거합니다.

  return <div>로그인 처리 중...</div>;
}

export default OAuthRedirect;
