// src/components/OAuthRedirectPage.jsx

import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const OAuthRedirectPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const accessToken = searchParams.get("token");

    if (accessToken) {
      localStorage.setItem("accessToken", "Bearer " + accessToken);
      alert("소셜 로그인 성공!");
      navigate("/"); // 메인 페이지(테스트 대시보드)로 이동
    } else {
      alert("소셜 로그인 실패");
      navigate("/");
    }
  }, [location, navigate]);

  return <div>로그인 처리 중입니다...</div>;
};

export default OAuthRedirectPage;
