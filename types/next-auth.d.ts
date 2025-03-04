import { DefaultSession, DefaultUser } from "next-auth"
import { UserRoles } from "@prisma/client"

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string
      role: UserRoles
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    role: UserRoles
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRoles
  }
}
