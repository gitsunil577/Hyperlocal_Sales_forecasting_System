import { NextRequest, NextResponse } from "next/server";

const AUTH_PAGES = ["/login", "/register"];

function isAuthPage(pathname: string) {
  return AUTH_PAGES.some((p) => pathname.startsWith(p));
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Ignore next internal/static/api routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/assets") ||
    pathname.startsWith("/api")
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get("sf_token")?.value;
  const role = req.cookies.get("sf_role")?.value; // "vendor" | "admin"

  const isLoggedIn = Boolean(token);

  const isVendorArea = pathname.startsWith("/dashboard");
  const isAdminArea = pathname.startsWith("/admin");

  // ✅ If user is not logged in and tries to access protected routes
  if (!isLoggedIn && (isVendorArea || isAdminArea)) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // ✅ If logged in and tries to access login/register, redirect based on role
  if (isLoggedIn && isAuthPage(pathname)) {
    const url = req.nextUrl.clone();
    url.pathname = role === "admin" ? "/admin" : "/dashboard";
    return NextResponse.redirect(url);
  }

  // ✅ Role-based access
  if (isLoggedIn && role) {
    // Vendor trying to access /admin
    if (role === "vendor" && isAdminArea) {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    // Admin trying to access /dashboard
    if (role === "admin" && isVendorArea) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }
  }

  // If token exists but role missing, force login again
  if (isLoggedIn && !role && (isVendorArea || isAdminArea)) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// ✅ Run middleware only on these routes
export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/login", "/register"],
};
