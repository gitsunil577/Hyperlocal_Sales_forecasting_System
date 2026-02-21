import type { NextAuthConfig } from "next-auth";

const sharedPages = ["/dashboard/upload-analyze"];

// Edge-compatible config — no Node.js-only imports (no MongoDB, no bcrypt)
// Used by middleware.ts which runs in the Edge Runtime
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;

      const isVendorArea = pathname.startsWith("/dashboard");
      const isAdminArea = pathname.startsWith("/admin");
      const isAuthPage =
        pathname.startsWith("/login") || pathname.startsWith("/register");

      // Not logged in → redirect to login
      if (!isLoggedIn && (isVendorArea || isAdminArea)) {
        const loginUrl = new URL("/login", nextUrl);
        loginUrl.searchParams.set("next", pathname);
        return Response.redirect(loginUrl);
      }

      // Logged in + trying to access auth pages → redirect to home
      if (isLoggedIn && isAuthPage) {
        const home =
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (auth!.user as any).role === "admin" ? "/admin" : "/dashboard";
        return Response.redirect(new URL(home, nextUrl));
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const role = (auth?.user as any)?.role;

      // Vendor trying to access /admin
      if (isLoggedIn && role === "vendor" && isAdminArea) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      // Admin trying to access /dashboard (shared pages allowed)
      if (
        isLoggedIn &&
        role === "admin" &&
        isVendorArea &&
        !sharedPages.some((p) => pathname.startsWith(p))
      ) {
        return Response.redirect(new URL("/admin", nextUrl));
      }

      return true;
    },
  },
  providers: [], // Providers are added in auth.ts (Node.js runtime only)
};
