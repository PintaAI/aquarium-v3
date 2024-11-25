import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  
  // Jika tidak login, redirect ke login
  if (!isLoggedIn) {
    return Response.redirect(new URL("/auth/login", nextUrl));
  }

  // Periksa role user
  const userRole = req.auth?.user?.role;
  
  // Jika bukan ADMIN, redirect ke homepage
  if (userRole !== "ADMIN") {
    return Response.redirect(new URL("/", nextUrl));
  }

  return NextResponse.next();
});
