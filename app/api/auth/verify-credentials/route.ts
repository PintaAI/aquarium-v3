import { db } from "@/lib/db"
import { compare } from "bcryptjs"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password } = body

    if (!email || !password) {
      return new NextResponse("Missing credentials", { status: 400 })
    }

    const user = await db.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true,
      },
    })

    if (!user) {
      return new NextResponse("Invalid credentials", { status: 401 })
    }

    if (!user.password) {
      return new NextResponse("Invalid credentials", { status: 401 })
    }

    const isValidPassword = await compare(password, user.password)
    if (!isValidPassword) {
      return new NextResponse("Invalid credentials", { status: 401 })
    }

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...userWithoutPassword } = user
    
    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error("[VERIFY_CREDENTIALS]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
