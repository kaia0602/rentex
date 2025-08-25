const KEY = "ACCESS_TOKEN";

export const setToken = (t) => localStorage.setItem(KEY, t);
export const getToken = () => localStorage.getItem(KEY);
export const clearToken = () => localStorage.removeItem(KEY);

// 안전한 JWT 파서
function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return {};
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch {
    return {};
  }
}

export function getUserIdFromToken(token) {
  try {
    const claims = parseJwt(token);
    const raw = claims.userId ?? claims.uid ?? claims.id ?? claims.sub;
    const uid = Number(raw);
    return Number.isFinite(uid) ? uid : null;
  } catch {
    return null;
  }
}

export function getRoleFromToken(token) {
  try {
    const claims = parseJwt(token);
    const raw = claims.auth || claims.role || claims.roles;
    if (!raw) return null;
    const first = Array.isArray(raw) ? raw[0] : String(raw).split(",")[0];
    return first.replace(/^ROLE_/, "") || null;
  } catch {
    return null;
  }
}

export function getCurrentUser() {
  const token = getToken();
  if (!token) return null; // null-safe
  const id = getUserIdFromToken(token);
  const role = getRoleFromToken(token);
  if (!id || !role) return null;
  return { id, role, token };
}

export function getRolesFromToken(token = getToken()) {
  try {
    const claims = parseJwt(token);
    const raw = claims.auth || claims.role || claims.roles;
    if (!raw) return [];
    const list = Array.isArray(raw) ? raw : String(raw).split(/[,\s]+/);
    return list.filter(Boolean).map((s) => s.trim());
  } catch {
    return [];
  }
}

export function hasRole(role, token = getToken()) {
  const roles = getRolesFromToken(token);
  return roles.some((r) => {
    const name = r.toUpperCase();
    return name === `ROLE_${role.toUpperCase()}` || name === role.toUpperCase();
  });
}
