// src/hooks/useCurrentUser.js
import { useEffect, useState } from "react";
import api from "api/client"; // ✅ axios 대신 이거 가져오기

export default function useCurrentUser() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    api
      .get("/users/me") // ✅ baseURL 자동 적용됨 (http://localhost:8080 붙음)
      .then((res) => setUser(res.data))
      .catch((err) => {
        console.error("사용자 정보 불러오기 실패:", err);
        setUser(null);
      });
  }, []);

  return user;
}
