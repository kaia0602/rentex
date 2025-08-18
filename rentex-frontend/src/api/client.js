// src/api/client.js
import axios from "axios";
import { getToken } from "utils/auth";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE || "http://localhost:8080/api",
  // withCredentials: true, // 쿠키 전략 쓸 때만 켜기
});
console.log("👉 API BASE =", process.env.REACT_APP_API_BASE);

// 요청 인터셉터: Authorization 자동 부착
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token && token.trim() !== "") {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터: 401 공통 처리
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      // clearToken();
      // window.location.href = "/authentication/sign-in";
    }
    return Promise.reject(err);
  },
);

export default api;
