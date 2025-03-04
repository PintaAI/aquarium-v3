import { prisma } from "@/lib/db"
import { compare } from "bcryptjs"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(null)
    }

    const user = await prisma.user.findUnique({
      where: {
        email
      },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
        image: true
      }
    })

    if (!user?.password) {
      return NextResponse.json(null)
    }

    const isPasswordValid = await compare(
      password,
      user.password
    )

    if (!isPasswordValid) {
      return NextResponse.json(null)
    }

    // Don't include password in the returned user object
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error("Credential verification error:", error)
    return NextResponse.json(null)
  }
}
