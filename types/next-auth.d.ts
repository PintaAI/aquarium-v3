import { DefaultSession, DefaultUser } from "next-auth"
import { UserRoles } from "@prisma/client"

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string
      role: UserRoles
      plan?: string
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    role: UserRoles
    plan?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRoles
    plan?: string
  }
}
