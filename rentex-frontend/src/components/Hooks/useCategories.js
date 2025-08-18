// src/components/Hooks/useCategories.js
import { useState, useEffect, useCallback } from "react";
import api from "api/client"; // ✅ axios → api

export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  // 카테고리 전체 조회
  useEffect(() => {
    api
      .get("/categories")
      .then((res) => setCategories(res.data))
      .catch(console.error);
  }, []);

  // 서브카테고리 조회
  const fetchSubCategories = useCallback((categoryId) => {
    if (!categoryId) {
      setSubCategories([]);
      return;
    }
    api
      .get(`/categories/${categoryId}/subcategories`)
      .then((res) => setSubCategories(res.data))
      .catch(console.error);
  }, []);

  return { categories, subCategories, fetchSubCategories };
}
