export const getImageUrl = (path) => {
  if (!path) return "/no-image.png";

  // ✅ 절대 URL (http/https)일 경우 그대로 리턴
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // ✅ 상대 경로(/uploads/...)일 경우 API 서버 주소 붙여줌
  return `${process.env.REACT_APP_API_BASE}${path}`;
};
