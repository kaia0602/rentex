// src/api/client.js
import axios from "axios";
import { getToken, clearToken } from "utils/auth"; // clearToken 반드시 import

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE || "http://localhost:8080/api",
  // withCredentials: true, // 쿠키 전략 쓸 때만 켜기
});
console.log("👉 API BASE =", process.env.REACT_APP_API_BASE);

// 요청 인터셉터: Authorization 자동 부착
api.interceptors.request.use((config) => {
  console.log("👉 요청 보냄:", config.method, config.url, config);
  const token = getToken();
  if (token && token.trim() !== "") {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터: 401/403 공통 처리
api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.log("👉 axios error intercept 실행됨", err?.response?.status, err?.response);
    const status = err?.response?.status;

    if (status === 401) {
      clearToken();
      if (window.confirm("로그인이 필요합니다. 로그인 페이지로 이동할까요?")) {
        window.location.href = "/authentication/sign-in";
      }
    } else if (status === 403) {
      if (window.confirm("권한이 없습니다. 메인 페이지로 이동할까요?")) {
        window.location.href = "/";
      }
    }
    return Promise.reject(err);
  },
);

export default api;
