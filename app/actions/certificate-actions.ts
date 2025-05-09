"use server"

import { getSession } from "@/lib/session"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function claimCertificate(): Promise<void> {
  try {
    // Get current session
    const session = await getSession()
    if (!session?.user?.id) {
      throw new Error("Unauthorized")
    }

    // Get user and check eligibility
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        isCertificateEligible: true,
        name: true,
        email: true
      }
    })

    if (!user) {
      throw new Error("User not found")
    }

    if (!user.isCertificateEligible) {
      throw new Error("User is not eligible for certificate")
    }

    // Here you would typically:
    // 1. Generate certificate (e.g., PDF generation)
    // 2. Save certificate to storage/database
    // 3. Update user's certificate status
    
    // TODO: Implement actual certificate generation

    revalidatePath("/sertifikat")
    
  } catch (error) {
    console.error("Certificate claim error:", error)
    throw error
  }
}
