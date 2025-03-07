import { NextRequest, NextResponse } from "next/server"
import { currentUser } from "@/lib/auth"
import { generateToken } from "@/app/actions/live-session-actions"

export async function GET(req: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = req.nextUrl.searchParams
    const room = searchParams.get("room")
    const username = searchParams.get("username")

    if (!room || !username) {
      return NextResponse.json(
        { error: "Missing room or username" },
        { status: 400 }
      )
    }

    // Generate token using the server action
    const token = await generateToken(room, username, user.id)
    
    return NextResponse.json({ token })
  } catch (error) {
    console.error("[TOKEN_ERROR]", error)
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    )
  }
}
