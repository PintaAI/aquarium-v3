"use server"

import { db } from "@/lib/db"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function getAllGuruUsers() {
  try {
    const guruUsers = await db.user.findMany({
      where: {
        role: 'GURU'
      },
      select: {
        id: true,
        name: true,
        image: true,
      }
    });
    return { success: true, users: guruUsers };
  } catch (error) {
    console.error('Failed to fetch GURU users:', error);
    return { success: false, error: 'Failed to fetch GURU users' };
  }
}

export async function updateProfile(data: {
  name: string
  image?: string
}) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      throw new Error("Unauthorized")
    }

    const updatedUser = await db.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        name: data.name,
        image: data.image,
      },
    })

    revalidatePath("/profil")
    return { success: true, data: updatedUser }
  } catch (error) {
    console.error("[UPDATE_PROFILE_ERROR]", error)
    return { success: false, error: "Failed to update profile" }
  }
}
