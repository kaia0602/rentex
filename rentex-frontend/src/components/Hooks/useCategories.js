// useCategories.js
import { useState, useEffect, useCallback } from "react";
import axios from "axios";

export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  useEffect(() => {
    axios
      .get("/api/categories")
      .then((res) => setCategories(res.data))
      .catch(console.error);
  }, []);

  const fetchSubCategories = useCallback((categoryId) => {
    if (!categoryId) {
      setSubCategories([]);
      return;
    }
    axios
      .get(`/api/categories/${categoryId}/subcategories`)
      .then((res) => setSubCategories(res.data))
      .catch(console.error);
  }, []);

  return { categories, subCategories, fetchSubCategories };
}
