import { db } from "@/lib/db"
import { compare } from "bcryptjs"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  console.log("[VERIFY_CREDENTIALS] Received request")
  try {
    const body = await req.json()
    console.log("[VERIFY_CREDENTIALS] Request body:", { email: body.email, hasPassword: !!body.password })
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
      console.log("[VERIFY_CREDENTIALS] User not found")
      return new NextResponse("Invalid credentials", { status: 401 })
    }

    if (!user.password) {
      console.log("[VERIFY_CREDENTIALS] User has no password set")
      return new NextResponse("Invalid credentials", { status: 401 })
    }

    const isValidPassword = await compare(password, user.password)
    if (!isValidPassword) {
      console.log("[VERIFY_CREDENTIALS] Invalid password")
      return new NextResponse("Invalid credentials", { status: 401 })
    }

    console.log("[VERIFY_CREDENTIALS] Authentication successful")

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...userWithoutPassword } = user
    
    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error("[VERIFY_CREDENTIALS]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
