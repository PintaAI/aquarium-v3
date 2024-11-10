"use server"

import * as z from "zod";
import { signIn } from "@/auth";
import { LoginSchema } from "@/schemas";
import { AuthError } from "next-auth";
import { getUserByEmail } from "@/data/user";
import { DEFAULT_REDIRECT_URL } from "@/routes";

/**
 * Function to perform login using email and password.
 * 
 * @param values - Object containing email and password.
 * @returns If login is successful, returns an object with "success", "redirectTo", and "shouldRefresh" properties.
 *          If there's a validation error, returns an object with an "error" property.
 *          If there's an error during login, returns an object with an "error" property.
 * @throws Error if there's an error other than validation or login errors.
 */
export const login = async (values: z.infer<typeof LoginSchema>) => {
    const validatedFields = LoginSchema.safeParse(values);

    if (!validatedFields.success) {
        console.log("Login validation failed:", validatedFields.error);
        return { error: "Invalid input" };
    }

    const { email, password } = validatedFields.data;

    try {
        const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        console.log("SignIn result:", result);

        if (result?.error) {
            return { error: "Invalid credentials" };
        }

        // Check user after successful login
        const user = await getUserByEmail(email);
        console.log("User found:", user);

        if (!user) {
            return { error: "User not found" };
        }

        // Log the user's role
        console.log("User role:", user.role);

        return { 
            success: "Login successful", 
            redirectTo: DEFAULT_REDIRECT_URL,
            shouldRefresh: true // Add this flag to indicate that the page should refresh
        };
    } catch (error) {
        console.error("Login error:", error);
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return { error: "Invalid credentials" };
                default:
                    return { error: "An error occurred" };
            }
        }
        throw error;
    }
};