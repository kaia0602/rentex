// src/api/client.js
import axios from "axios";
import { getToken } from "utils/auth";

const api = axios.create({
<<<<<<< HEAD
  // baseURL을 백엔드 서버의 전체 주소로 명확하게 지정
  // 모든 요청이 'http://localhost:8080'으로 시작
  baseURL: "http://localhost:8080",
=======
  baseURL: process.env.REACT_APP_API_BASE || "http://localhost:8080/api",
  // withCredentials: true, // 쿠키 전략 쓸 때만 켜기
>>>>>>> origin/feature/rentaladd
});
console.log("👉 API BASE =", process.env.REACT_APP_API_BASE);

// 요청 인터셉터: Authorization 자동 부착
api.interceptors.request.use((config) => {
<<<<<<< HEAD
  const token = localStorage.getItem("accessToken");
  if (token) {
    // Authorization 헤더에 토큰을 추가
=======
  const token = getToken();
  if (token && token.trim() !== "") {
    config.headers = config.headers || {};
>>>>>>> origin/feature/rentaladd
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
