import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Use the Edge-compatible config (no MongoDB/bcrypt) for middleware
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/inventory", "/inventory/:path*", "/predictions", "/reports", "/login", "/register"],
};
