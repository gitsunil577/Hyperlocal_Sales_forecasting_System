// lib/auth-store.ts
export type UserRole = "vendor" | "admin";

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const parts = document.cookie.split("; ").map((p) => p.split("="));
  const match = parts.find(([k]) => k === name);
  return match ? decodeURIComponent(match[1] || "") : null;
}

export function getClientRole(): UserRole | null {
  const role = getCookie("sf_role");
  return role === "admin" || role === "vendor" ? role : null;
}

export function isClientLoggedIn(): boolean {
  return Boolean(getCookie("sf_token"));
}
