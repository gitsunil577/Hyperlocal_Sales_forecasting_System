// lib/auth-client.ts
export type UserRole = "vendor" | "admin";

type LoginResponse = {
  ok: boolean;
  role: UserRole;
  name?: string;
};

function setCookie(name: string, value: string, maxAgeSeconds = 60 * 60 * 24) {
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; path=/; max-age=${maxAgeSeconds}; samesite=lax`;
}

function clearCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0; samesite=lax`;
}

/**
 * FRONTEND-ONLY (for now):
 * Simulates backend login. Later replace the body of this function with:
 *   await fetch("/api/auth/login", ...)
 * and DO NOT set cookies on client (backend sets httpOnly cookie).
 */
export async function loginClient(email: string, password: string): Promise<LoginResponse> {
  await new Promise((r) => setTimeout(r, 800));

  // Basic validation
  if (!email || !password) return { ok: false, role: "vendor" };

  // TEMP: for frontend build/demo only.
  // Later: backend returns the role.
  const role: UserRole = email.toLowerCase().includes("admin") ? "admin" : "vendor";

  // TEMP: cookie readable by frontend + middleware (during frontend phase)
  setCookie("sf_token", "1");
  setCookie("sf_role", role);
  setCookie("sf_user", email);

  return { ok: true, role, name: email.split("@")[0] };
}

export function logoutClient() {
  clearCookie("sf_token");
  clearCookie("sf_role");
  clearCookie("sf_user");

  // Optional: clear local/session storage if used later
  localStorage.clear();
  sessionStorage.clear();
}
