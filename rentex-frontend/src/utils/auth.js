// src/utils/auth.js
const KEY = "ACCESS_TOKEN";

export const setToken = (t) => localStorage.setItem(KEY, t);
export const getToken = () => localStorage.getItem(KEY);
export const clearToken = () => localStorage.removeItem(KEY);

export function getUserIdFromToken(token) {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const b64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64.padEnd(b64.length + ((4 - (b64.length % 4)) % 4), "=");
    const json = atob(padded);
    const claims = JSON.parse(
      decodeURIComponent(
        Array.from(json)
          .map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, "0")}`)
          .join(""),
      ),
    );
    const raw = claims.userId ?? claims.uid ?? claims.id ?? claims.sub;
    const uid = Number(raw);
    return Number.isFinite(uid) ? uid : null;
  } catch {
    return null;
  }
}

export function getRoleFromToken(token) {
  try {
    const { auth } = parseJwt(token);
    if (!auth) return null;
    const first = Array.isArray(auth) ? auth[0] : String(auth).split(",")[0];
    return first.replace(/^ROLE_/, "") || null;
  } catch {
    return null;
  }
}

export function getCurrentUser() {
  const token = getToken().trim();
  if (!token) return null;
  const id = getUserIdFromToken(token);
  const role = getRoleFromToken(token);
  if (!id || !role) return null;
  return { id, role, token };
}

export function getRolesFromToken(token) {
  try {
    const { auth } = parseJwt(token) || {};
    if (!auth) return [];
    const list = Array.isArray(auth) ? auth : String(auth).split(/[,\s]+/);
    return list.filter(Boolean).map((s) => s.trim());
  } catch {
    return [];
  }
}

export function hasRole(role, token = getToken()) {
  const roles = getRolesFromToken(token);
  return roles.some((r) => {
    const name = r.toUpperCase();
    return name === `ROLE_${target}` || name === target;
  });
}
