'use server'

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { UserRoles } from "@prisma/client"
import { revalidatePath } from "next/cache"

export async function setRole(role: UserRoles) {
  const session = await auth()

  if (!session || !session.user) {
    return { success: false, error: 'Unauthorized' }
  }

  if (!Object.values(UserRoles).includes(role)) {
    return { success: false, error: 'Invalid role' }
  }

  try {
    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: { role: role },
    })

    revalidatePath('/')
    return { success: true, user: updatedUser }
  } catch (error) {
    console.error('Error updating user role:', error)
    return { success: false, error: 'Failed to update user role' }
  }
}