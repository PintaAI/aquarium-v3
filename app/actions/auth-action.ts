"use server"

import { db } from "@/lib/db"
import { hash } from "bcryptjs"

interface RegisterInput {
  email: string
  password: string
  name?: string
}

export async function registerUser(data: RegisterInput) {
  try {
    const { email, password, name } = data

    if (!email || !password) {
      return { error: "Missing required fields" }
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return { error: "User already exists" }
    }

    // Hash password
    const hashedPassword = await hash(password, 12)

    // Create user
    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: "MURID", // Default role
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    })

    return { user }
  } catch (error) {
    console.error("Registration error:", error)
    return { error: "Something went wrong" }
  }
}
