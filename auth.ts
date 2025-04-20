import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "./lib/db"
import authConfig from "./auth.config"
import { getUserById } from "./data/user"
import { UserRoles, UserPlan } from "@prisma/client" // Added UserPlan import

 
export const { auth, handlers, signIn, signOut } = NextAuth({
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
    signOut: "/auth/signout",
  },
  events: {
    async linkAccount({user}) {
      await db.user.update({
        where: {id: user.id},
        data: {emailVerified: new Date()}
      })
    }
  },
  callbacks: {
   async session({session,token}){
    if (session.user && token.sub) {
    session.user.id = token.sub;
    }

    if (token.role && session.user) {
    session.user.role = token.role as UserRoles;
    }
    // Add plan to session from token
    if (token.plan && session.user) {
      session.user.plan = token.plan as UserPlan;
    }

    return session
   },
   async jwt({token}){
    if (!token.sub) return token;
  
    const existingUser = await getUserById(token.sub);

    if (existingUser) {
      token.role = existingUser.role;
      // Add plan to token from database user
      token.plan = existingUser.plan;
    }

    return token
   }
  },
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  ...authConfig,
})
