import NextAuth from "next-auth";
import { UserRoles } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role?: UserRoles;
      plan?: string;
      name?: string;
      email?: string;
      image?: string;
    };
  }

  interface User {
    plan?: string;
    role?: UserRoles;
  }
}