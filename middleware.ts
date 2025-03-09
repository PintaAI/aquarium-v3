import NextAuth from "next-auth"
import { config as authConfig } from "./auth.config"

export const { auth: middleware } = NextAuth(authConfig)

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
    "/api/auth/verify-credentials"
  ],
}
