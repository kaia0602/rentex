// src/utils/auth.js
const KEY = "ACCESS_TOKEN";

export const setToken = (t) => localStorage.setItem(KEY, t);
export const getToken = () => localStorage.getItem(KEY);
export const clearToken = () => localStorage.removeItem(KEY);
