"use server"

import { db } from "@/lib/db"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function updateUserRole(userId: string, role: "USER" | "GURU" | "MURID" | "ADMIN") {
  const session = await auth()
  
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }

  await db.user.update({
    where: { id: userId },
    data: { role }
  })

  revalidatePath("/dashboard/control-panel-x8472")
}

export async function updateUserPlan(userId: string, plan: "FREE" | "PREMIUM") {
  const session = await auth()
  
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }

  await db.user.update({
    where: { id: userId },
    data: { plan }
  })

  revalidatePath("/dashboard/control-panel-x8472")
}
