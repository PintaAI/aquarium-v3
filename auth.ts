import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "./lib/db"
import authConfig from "./auth.config"
import { getUserById } from "./data/user"
import { UserRoles } from "@prisma/client"

 
export const { auth, handlers, signIn, signOut } = NextAuth({
  pages: {
    signIn: "/auth/signin",
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

    session.user.plan = "premium";

    if (token.role && session.user) {
    session.user.role = token.role as UserRoles;
    }

    return session
   },
   async jwt({token}){
    if (!token.sub) return token;
  
    const existingUser = await getUserById(token.sub);

    if (existingUser) {
      token.role = existingUser.role;
    }

    return token
   }
  },
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  ...authConfig,
})