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
