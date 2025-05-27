import { createTryout } from "@/app/actions/tryout-actions"
import { currentUser } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const user = await currentUser()
    if (!user || user.role !== "GURU") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { koleksiSoalId, startTime, endTime, duration } = body

    const tryout = await createTryout(
      user.id,
      koleksiSoalId,
      new Date(startTime),
      new Date(endTime),
      duration
    )

    return NextResponse.json(tryout)
  } catch (error) {
    console.error("[TRYOUTS_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
