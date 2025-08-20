// src/contexts/AuthContext.js

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import PropTypes from "prop-types";
// utils/auth 파일에서 토큰을 가져오고 제거하는 함수를 import 합니다.
import { getToken, removeToken } from "utils/auth";

// 1. Context 생성
const AuthContext = createContext(null);

// 2. Provider 컴포넌트 생성
export function AuthProvider({ children }) {
  // 3. useState의 초기값을 getToken()으로 설정합니다.
  // 앱이 시작될 때 토큰이 있으면 true, 없으면 false로 시작합니다.
  const [isLoggedIn, setIsLoggedIn] = useState(!!getToken());

  const login = useCallback(() => {
    // 로그인 폼에서 setToken을 이미 호출했으므로, 여기서는 React 상태만 변경합니다.
    setIsLoggedIn(true);
  }, []);

  const logout = useCallback(() => {
    // 4. 로그아웃 시 토큰을 제거하고 React 상태도 변경합니다.
    removeToken();
    setIsLoggedIn(false);
  }, []);

  const value = useMemo(() => ({ isLoggedIn, login, logout }), [isLoggedIn, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// 5. Custom Hook 생성 (기존과 동일)
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
