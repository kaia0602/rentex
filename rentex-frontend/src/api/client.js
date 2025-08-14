import axios from "axios";

const api = axios.create({
  // ❗ baseURL을 백엔드 서버의 전체 주소로 명확하게 지정합니다.
  // 이렇게 하면 모든 요청이 'http://localhost:8080'으로 시작됩니다.
  baseURL: "http://localhost:8080",
});

// 이 부분은 JWT 토큰을 모든 요청 헤더에 자동으로 추가해주는 아주 좋은 코드입니다.
// 그대로 유지하면 됩니다.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    // 'Authorization' 헤더에 토큰을 추가합니다.
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
