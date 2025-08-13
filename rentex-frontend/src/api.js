// src/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: false, // JWT는 헤더로 보낼거면 false
  validateStatus: () => true, // 컴포넌트에서 상태코드 직접 처리
});

// 매 요청마다 JWT 자동 첨부
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
