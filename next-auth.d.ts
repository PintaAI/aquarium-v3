import NextAuth from "next-auth";
import { UserRoles, UserPlan } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role?: UserRoles;
      plan?: UserPlan;
      name?: string;
      email?: string;
      image?: string;
    };
  }

  interface User {
    plan?: UserPlan;
    role?: UserRoles;
  }
}
