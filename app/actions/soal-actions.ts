"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { currentUser } from "@/lib/auth"
import { Difficulty } from "@prisma/client"

interface CreateOpsi {
  opsiText: string
  isCorrect: boolean
}

interface CreateSoal {
  pertanyaan: string
  attachmentUrl?: string
  attachmentType?: string
  difficulty?: Difficulty
  explanation?: string
  opsis: CreateOpsi[]
}

export async function createKoleksiSoal(
  nama: string, 
  deskripsi: string | undefined,
  soals: CreateSoal[] = [],
  isPrivate: boolean = false
) {
  try {
    const user = await currentUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const result = await db.$transaction(async (tx) => {
      // Create koleksi first
      const koleksi = await tx.koleksiSoal.create({
        data: { 
          nama, 
          deskripsi,
          isPrivate
        }
      })

      // If there are soals, create them all
      if (soals.length > 0) {
        for (const soal of soals) {
          await tx.soal.create({
            data: {
              koleksiId: koleksi.id,
              authorId: user.id,
              pertanyaan: soal.pertanyaan,
              attachmentUrl: soal.attachmentUrl,
              attachmentType: soal.attachmentType,
              difficulty: soal.difficulty,
              explanation: soal.explanation,
              opsis: {
                createMany: {
                  data: soal.opsis
                }
              }
            }
          })
        }
      }

      return koleksi
    })
    
    revalidatePath("/soal")
    return { success: true, data: result }
  } catch (error) {
    console.error("[CREATE_KOLEKSI_SOAL]", error)
    return { success: false, error: "Gagal membuat koleksi soal" }
  }
}

export async function getKoleksiSoals() {
  try {
    const user = await currentUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const collections = await db.koleksiSoal.findMany({
      include: {
        soals: {
          include: {
            opsis: true,
            author: {
              select: {
                id: true,
                name: true,
                role: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return { success: true, data: collections }
  } catch (error) {
    console.error("[GET_KOLEKSI_SOALS]", error)
    return { success: false, error: "Gagal mengambil koleksi soal" }
  }
}

export async function getKoleksiSoal(id: number) {
  try {
    const user = await currentUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const collection = await db.koleksiSoal.findUnique({
      where: { id },
      include: {
        soals: {
          include: {
            opsis: true,
            author: {
              select: {
                id: true,
                name: true,
                role: true
              }
            }
          }
        }
      }
    })

    if (!collection) {
      return { success: false, error: "Koleksi soal tidak ditemukan" }
    }
    
    return { success: true, data: collection }
  } catch (error) {
    console.error("[GET_KOLEKSI_SOAL]", error)
    return { success: false, error: "Gagal mengambil koleksi soal" }
  }
}

export async function updateKoleksiSoal(
  id: number,
  nama: string,
  deskripsi?: string,
  soals?: CreateSoal[],
  isPrivate: boolean = false
) {
  try {
    const user = await currentUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const updated = await db.$transaction(async (tx) => {
      // Update koleksi
      const updatedKoleksi = await tx.koleksiSoal.update({
        where: { id },
        data: { 
          nama, 
          deskripsi,
          isPrivate
        }
      })

      // If soals provided, update them
      if (soals !== undefined) {
        // Delete existing soals and their options
        await tx.opsi.deleteMany({
          where: {
            soal: {
              koleksiId: id
            }
          }
        })
        await tx.soal.deleteMany({
          where: { koleksiId: id }
        })

        // Create new soals
        if (soals.length > 0) {
          for (const soal of soals) {
            await tx.soal.create({
              data: {
                koleksiId: id,
                authorId: user.id,
                pertanyaan: soal.pertanyaan,
                attachmentUrl: soal.attachmentUrl,
                attachmentType: soal.attachmentType,
                difficulty: soal.difficulty,
                explanation: soal.explanation,
                opsis: {
                  createMany: {
                    data: soal.opsis
                  }
                }
              }
            })
          }
        }
      }

      return updatedKoleksi
    })
    
    revalidatePath("/soal")
    return { success: true, data: updated }
  } catch (error) {
    console.error("[UPDATE_KOLEKSI_SOAL]", error)
    return { success: false, error: "Gagal memperbarui koleksi soal" }
  }
}

export async function deleteKoleksiSoal(id: number) {
  try {
    const user = await currentUser()
    if (!user) return { success: false, error: "Unauthorized" }

    // Check if collection exists first
    const exists = await db.koleksiSoal.findUnique({
      where: { id }
    })

    if (!exists) {
      return { success: false, error: "Koleksi soal tidak ditemukan" }
    }

    await db.$transaction(async (tx) => {
      // Delete options first
      await tx.opsi.deleteMany({
        where: {
          soal: {
            koleksiId: id
          }
        }
      })

      // Delete soals
      await tx.soal.deleteMany({
        where: { koleksiId: id }
      })

      // Delete koleksi
      await tx.koleksiSoal.delete({
        where: { id }
      })
    })
    
    revalidatePath("/soal")
    return { success: true }
  } catch (error) {
    console.error("[DELETE_KOLEKSI_SOAL]", error)
    return { success: false, error: "Gagal menghapus koleksi soal" }
  }
}

export async function copySoalToCollection(
  sourceCollectionId: number,
  targetCollectionId: number,
  soalIds: number[]
) {
  try {
    const user = await currentUser()
    if (!user) return { success: false, error: "Unauthorized" }

    await db.$transaction(async (tx) => {
      // Get source soals
      const sourceSoals = await tx.soal.findMany({
        where: {
          id: { in: soalIds },
          koleksiId: sourceCollectionId
        },
        include: {
          opsis: true
        }
      })

      // Create copies in target collection
      for (const soal of sourceSoals) {
        await tx.soal.create({
          data: {
            koleksiId: targetCollectionId,
            authorId: user.id,
            pertanyaan: soal.pertanyaan,
            attachmentUrl: soal.attachmentUrl,
            attachmentType: soal.attachmentType,
            difficulty: soal.difficulty,
            explanation: soal.explanation,
            opsis: {
              createMany: {
                data: soal.opsis.map(opsi => ({
                  opsiText: opsi.opsiText,
                  isCorrect: opsi.isCorrect
                }))
              }
            }
          }
        })
      }
    })

    revalidatePath("/soal")
    return { success: true }
  } catch (error) {
    console.error("[COPY_SOAL]", error)
    return { success: false, error: "Gagal menyalin soal" }
  }
}

export async function getSoal(id: number) {
  try {
    const user = await currentUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const soal = await db.soal.findUnique({
      where: { id },
      include: {
        opsis: true,
        author: {
              select: {
                id: true,
                name: true,
                role: true
          }
        }
      }
    })

    if (!soal) {
      return { success: false, error: "Soal tidak ditemukan" }
    }

    return { success: true, data: soal }
  } catch (error) {
    console.error("[GET_SOAL]", error)
    return { success: false, error: "Gagal mengambil soal" }
  }
}
