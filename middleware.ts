
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {jwtVerify}from "jose"

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;
  // console.log("token:", token);
  const isLoginPage = pathname === "/";
  const isAdminPage = pathname.startsWith("/karyawan");
  // console.log("SECRET:", process.env.JWT_SECRET!);
  let isValid = false;
  
   if (token) {
    try {
      await jwtVerify(token, secret);
      isValid = true;
      // console.log("valid:", isValid);
    } catch (err) {
      console.log("JWT ERROR:", err);
    }
  }

  // ===== AUTH REDIRECT LOGIC =====
  if (isAdminPage && !isValid) {
    const res = NextResponse.redirect(new URL("/", request.url));
    setCors(res);
    return res;
  }

  if (isLoginPage && isValid) {
    const res = NextResponse.redirect(new URL("/karyawan", request.url));
    setCors(res);
    return res;
  }

  // ===== DEFAULT PASS THROUGH =====
  const response = NextResponse.next();
  setCors(response);
  return response;
}

// 🔥 helper biar ga duplikat
function setCors(res: NextResponse) {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, DELETE, PUT, PATCH"
  );
  res.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
}

export const config = {
  matcher: ["/:path*"],
};