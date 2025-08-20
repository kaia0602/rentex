// src/App.jsx

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TestDashboard from "./components/TestDashboard";
import OAuthRedirectPage from "./components/OAuthRedirectPage";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* 기본 경로는 테스트 대시보드를 보여줍니다. */}
        <Route path="/" element={<TestDashboard />} />

        {/* 소셜 로그인 후 리디렉션될 경로입니다. */}
        <Route path="/oauth-redirect" element={<OAuthRedirectPage />} />
      </Routes>
    </Router>
  );
};

export default App;
