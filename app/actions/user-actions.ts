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

export async function updateCertificateEligibility(userId: string, isEligible: boolean) {
  "use server";

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized: No session found." };
    }

    // Verify the current user is a GURU
    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (currentUser?.role !== 'GURU') {
      return { success: false, error: "Forbidden: Only GURU can update eligibility." };
    }

    // Update the target user's eligibility
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { isCertificateEligible: isEligible },
    });

    revalidatePath("/dashboard/users"); // Revalidate the user list page
    return { success: true, data: { userId: updatedUser.id, isCertificateEligible: updatedUser.isCertificateEligible } };

  } catch (error) {
    console.error("[UPDATE_CERTIFICATE_ELIGIBILITY_ERROR]", error);
    return { success: false, error: "Failed to update certificate eligibility." };
  }
}
