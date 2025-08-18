export const getImageUrl = (path) => {
  if (!path) return "/no-image.png";

  // 절대 URL이면 그대로 리턴
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // API_BASE에서 /api 잘라내고 붙이기
  const apiBase = process.env.REACT_APP_API_BASE || "http://localhost:8080/api";
  const serverBase = apiBase.replace(/\/api$/, ""); // ✅ /api 제거
  return `${serverBase}${path}`;
};
