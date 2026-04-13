import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const publicRoutes = ["/", "/login", "/register"];
const authRoutes = ["/login", "/register"];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  // Agar auth route pe hai aur already logged in hai
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // Agar protected route pe hai aur logged in nahi hai
  if (!isPublicRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
