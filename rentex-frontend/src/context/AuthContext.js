import React, { createContext, useCallback, useContext, useMemo, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { getToken, clearToken, setToken, setRefreshToken, clearRefreshToken } from "utils/auth";
import api from "api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(!!getToken());
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (isLoggedIn) {
      api
        .get("/users/me")
        .then((res) => setUser(res.data))
        .catch(() => {
          clearToken();
          clearRefreshToken();
          setIsLoggedIn(false);
          setUser(null);
        });
    } else {
      setUser(null);
    }
  }, [isLoggedIn]);

  // ✅ accessToken + refreshToken 둘 다 지원
  const login = useCallback((accessToken, refreshToken) => {
    if (accessToken) {
      setToken(accessToken);
      api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
    }
    if (refreshToken) {
      setRefreshToken(refreshToken);
    }
    setIsLoggedIn(!!accessToken);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    clearRefreshToken();
    delete api.defaults.headers.common["Authorization"];
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
