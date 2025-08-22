import React, { createContext, useCallback, useContext, useMemo, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { getToken, clearToken, setToken } from "utils/auth";
import api from "api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(!!getToken());
  const [user, setUser] = useState(null); // [추가] user 상태

  useEffect(() => {
    if (isLoggedIn) {
      api
        .get("/users/me")
        .then((res) => setUser(res.data))
        .catch(() => {
          // 정보 불러오기 실패 시 강제 로그아웃
          clearToken();
          setIsLoggedIn(false);
          setUser(null);
        });
    } else {
      setUser(null);
    }
  }, [isLoggedIn]);

  const login = useCallback((token) => {
    setToken(token);
    setIsLoggedIn(true);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setIsLoggedIn(false);
    setUser(null);
  }, []);

  const refreshUser = useCallback(() => {
    if (isLoggedIn) {
      api.get("/users/me").then((res) => setUser(res.data));
    }
  }, [isLoggedIn]);

  const value = useMemo(
    () => ({ isLoggedIn, user, login, logout, refreshUser }),
    [isLoggedIn, user, login, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
