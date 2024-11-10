"use server"

import * as z from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { registerSchema } from "@/schemas";
import { getUserByEmail } from "@/data/user";
import { UserRoles } from "@prisma/client";

// Update the RegisterSchema to include role
const ExtendedRegisterSchema = registerSchema.extend({
  role: z.nativeEnum(UserRoles)
});

export const register = async (values: z.infer<typeof ExtendedRegisterSchema>) => {
    const validatedFields = ExtendedRegisterSchema.safeParse(values);

    if (!validatedFields.success){
        return {error: "Invalid input"};
    }

    const { email, password, name, role } = validatedFields.data;
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await getUserByEmail(email);

    if (existingUser){
        return {error: "User already exists"};
    }

    await db.user.create({
        data: {
            email,
            password: hashedPassword,
            name,
            role
        }
    });

    // send verification email
    console.log(values);
    return { success: "Email berhasil dikirim" };
};