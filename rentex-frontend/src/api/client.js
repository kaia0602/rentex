import axios from "axios";

const api = axios.create({
  baseURL: "/api", // package.json proxy 덕분에 localhost:8080 으로 전달됨
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
