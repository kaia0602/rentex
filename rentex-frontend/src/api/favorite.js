import api from "api/client";

// 찜 토글 (등록/해제)
export const toggleFavorite = async (itemId) => {
  const { data } = await api.post(`/favorites/${itemId}/toggle`);
  return data; // { favorite: true/false }
};

// 단건 아이템 찜 여부 확인
export const checkFavorite = async (itemId) => {
  const { data } = await api.get(`/favorites/check`, { params: { itemId } });
  return data; // { favorite: true/false }
};

// 내 찜 목록 조회
export const fetchMyFavorites = async () => {
  const { data } = await api.get(`/favorites`);
  return data; // ItemResponseDTO[]
};
