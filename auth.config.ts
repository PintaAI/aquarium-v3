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

        const user = await fetch(new URL("/api/auth/verify-credentials", process.env.NEXTAUTH_URL), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        }).then(res => res.json())

        if (!user?.id) {
          return null
        }

        return user
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
