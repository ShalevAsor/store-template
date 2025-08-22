// middleware.ts
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const isAdminPath = request.nextUrl.pathname.startsWith("/admin");
  const isLoginPage = request.nextUrl.pathname.startsWith("/admin/login");

  if (isAdminPath) {
    const adminSession = request.cookies.get("admin-session");
    if (isLoginPage) {
      // if already logged in redirect to admin dashboard
      if (adminSession?.value === process.env.ADMIN_PASSWORD) {
        const adminUrl = new URL("/admin", request.url);
        return NextResponse.redirect(adminUrl);
      }
      return NextResponse.next();
    }
    // protect other admin pages
    if (!adminSession || adminSession.value !== process.env.ADMIN_PASSWORD) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
