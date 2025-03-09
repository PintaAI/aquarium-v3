import Credentials from "next-auth/providers/credentials"
import { type NextAuthConfig } from "next-auth"
import { UserRoles } from "@prisma/client"

export const config = {
  theme: {
    logo: "/next.svg",
    brandColor: "#2563eb",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials): Promise<any> {
        if (!credentials?.email || !credentials?.password || 
            typeof credentials.email !== 'string' || 
            typeof credentials.password !== 'string') {
          return null
        }

        try {
          const isVercelPreview = Boolean(
            process.env.VERCEL_ENV === 'preview' && process.env.VERCEL_URL
          )
          
          console.log("[AUTH] VERCEL_ENV:", process.env.VERCEL_ENV)
          console.log("[AUTH] Is Vercel Preview:", isVercelPreview)
          console.log("[AUTH] VERCEL_URL:", process.env.VERCEL_URL)
          console.log("[AUTH] NEXTAUTH_URL:", process.env.NEXTAUTH_URL)

          let baseUrl: string
          if (process.env.NEXTAUTH_URL) {
            baseUrl = process.env.NEXTAUTH_URL
          } else if (isVercelPreview) {
            baseUrl = `https://${process.env.VERCEL_URL}`
          } else {
            baseUrl = 'http://localhost:3000'
          }
          
          console.log("[AUTH] Using baseUrl:", baseUrl)
          
          const response = await fetch(new URL("/api/auth/verify-credentials", baseUrl), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
          })

          if (!response.ok) {
            console.error("[AUTH] Failed to verify credentials:", await response.text())
            return null
          }

          const user = await response.json()
        if (!user?.id) {
          return null
        }

        return user
        } catch (error) {
          console.error("[AUTH] Error verifying credentials:", error)
          return null
        }
      }
    })
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub
        session.user.role = token.role as UserRoles
      }
      return session
    }
  },
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/signout"
  }
} satisfies NextAuthConfig
