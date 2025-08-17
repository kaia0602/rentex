import axios from "axios";

const api = axios.create({
  // baseURL을 백엔드 서버의 전체 주소로 명확하게 지정
  // 모든 요청이 'http://localhost:8080'으로 시작
  baseURL: "http://localhost:8080",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    // Authorization 헤더에 토큰을 추가
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
