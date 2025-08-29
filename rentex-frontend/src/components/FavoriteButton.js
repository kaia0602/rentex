/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { toggleFavorite, checkFavorite } from "api/favorite";
import { getCurrentUser } from "utils/auth";

export default function FavoriteButton({ itemId, size = "medium", iconSize = 24, onChange }) {
  const [isFav, setIsFav] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = !!getCurrentUser();

  useEffect(() => {
    let mounted = true;
    if (!isLoggedIn) {
      setIsFav(false);
      setLoading(false);
      return;
    }
    checkFavorite(itemId)
      .then((res) => mounted && setIsFav(!!res.favorite))
      .catch(() => mounted && setIsFav(false))
      .finally(() => mounted && setLoading(false));
    return () => (mounted = false);
  }, [itemId, isLoggedIn]);

  const onClick = async (e) => {
    e.stopPropagation(); // ✅ 카드 클릭 이벤트 막기
    if (!isLoggedIn) {
      alert("로그인이 필요합니다.");
      navigate("/authentication/sign-in", {
        state: { from: location.pathname + location.search },
        replace: true,
      });
      return;
    }
    try {
      const res = await toggleFavorite(itemId);
      setIsFav(!!res.favorite);
      onChange && onChange(!!res.favorite);
    } catch {
      alert("잠시 후 다시 시도해주세요.");
    }
  };

  return (
    <Tooltip title={isFav ? "찜 해제" : "찜하기"}>
      <span>
        <IconButton onClick={onClick} size={size} disabled={loading}>
          {isFav ? (
            <FavoriteIcon color="error" sx={{ fontSize: iconSize }} />
          ) : (
            <FavoriteBorderIcon sx={{ fontSize: iconSize }} />
          )}
        </IconButton>
      </span>
    </Tooltip>
  );
}
