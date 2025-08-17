// 본 페이지는 로그인 이후 로그아웃을 구현하기 위함.

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function SignOut() {
  const navigate = useNavigate();

  useEffect(() => {
    // 1. 로컬 스토리지에서 토큰 삭제
    localStorage.removeItem("accessToken");

    // 2. 사용자에게 알림
    alert("로그아웃 되었습니다.");

    // 3. 로그인 페이지로 리디렉션
    navigate("/authentication/sign-in");
  }, [navigate]);

  return null;
}

export default SignOut;
