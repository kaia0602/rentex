import { useEffect, useState } from "react";
import axios from "axios";

export default function useCurrentUser() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    axios
      .get("http://localhost:8080/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUser(res.data))
      .catch((err) => {
        console.error("사용자 정보 불러오기 실패:", err);
        setUser(null);
      });
  }, []);

  return user;
}
