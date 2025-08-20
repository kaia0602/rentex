import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { getToken, clearToken } from "utils/auth";

// Context 생성
const AuthContext = createContext(null);

// Provider 컴포넌트 생성
export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(!!getToken());

  const login = useCallback(() => {
    setIsLoggedIn(true);
  }, []);

  const logout = useCallback(() => {
    clearToken(); // 함수 이름 변경
    setIsLoggedIn(false);
  }, []);

  const value = useMemo(() => ({ isLoggedIn, login, logout }), [isLoggedIn, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// Custom Hook 생성
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
