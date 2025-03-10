"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { currentUser } from "@/lib/auth"

interface CreateVocabularyItem {
  korean: string
  indonesian: string
  type?: "WORD" | "SENTENCE"
}

interface VocabularyItem extends CreateVocabularyItem {
  id: number
  isChecked: boolean
  type: "WORD" | "SENTENCE"
  collectionId: number
  createdAt: Date
  updatedAt: Date
}

// Collection Actions
export async function createVocabularyCollection(
  title: string, 
  description: string | undefined,
  items: CreateVocabularyItem[] = []
) {
  try {
    const user = await currentUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const isPublic = user.role === "GURU"
    
    // Buat collection dan items sekaligus menggunakan transaction
    const result = await db.$transaction(async (tx) => {
      // Buat collection dulu
      const collection = await tx.vocabularyCollection.create({
        data: { title, description, userId: user.id, isPublic }
      })

      // Kalau ada items, buat semuanya
      if (items.length > 0) {
        await tx.vocabularyItem.createMany({
          data: items.map(item => ({
            ...item,
            collectionId: collection.id,
            type: item.type || "WORD"
          }))
        })
      }

      return collection
    })
    
    revalidatePath("/vocabulary")
    return { success: true, data: result }
  } catch (error) {
    console.error("[CREATE_VOCABULARY_COLLECTION]", error)
    return { success: false, error: "Gagal membuat kumpulan kosakata" }
  }
}

export async function getVocabularyCollection(id: number) {
  try {
    const user = await currentUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const collection = await db.vocabularyCollection.findFirst({
      where: {
        id,
        OR: [
          { userId: user.id },
          { isPublic: true }
        ]
      },
      include: {
        items: true,
        user: {
          select: {
            name: true,
            role: true
          }
        }
      }
    })

    if (!collection) {
      return { success: false, error: "Kumpulan kosakata tidak ditemukan" }
    }
    
    return { success: true, data: collection }
  } catch (error) {
    console.error("[GET_VOCABULARY_COLLECTION]", error)
    return { success: false, error: "Gagal mengambil kumpulan kosakata" }
  }
}

export async function getVocabularyCollections() {
  try {
    const user = await currentUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const collections = await db.vocabularyCollection.findMany({
      where: {
        OR: [
          { userId: user.id },
          { isPublic: true }
        ]
      },
      include: {
        items: {
          select: {
            id: true,
            korean: true,
            indonesian: true,
            isChecked: true,
            type: true,
            createdAt: true,
            updatedAt: true,
            collectionId: true
          }
        },
        user: {
          select: {
            name: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return { success: true, data: collections }
  } catch (error) {
    console.error("[GET_VOCABULARY_COLLECTIONS]", error)
    return { success: false, error: "Gagal mengambil kumpulan kosakata" }
  }
}

export async function updateVocabularyCollection(
  id: number, 
  title: string, 
  description?: string,
  items?: CreateVocabularyItem[]
) {
  try {
    const user = await currentUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const collection = await db.vocabularyCollection.findFirst({
      where: { id, userId: user.id }
    })
    if (!collection) return { success: false, error: "Kumpulan kosakata tidak ditemukan" }

    const isPublic = user.role === "GURU" ? true : collection.isPublic

    // Gunakan transaction untuk update collection dan items
    const updated = await db.$transaction(async (tx) => {
      // Update collection
      const updatedCollection = await tx.vocabularyCollection.update({
        where: { id },
        data: { title, description, isPublic }
      })

      // Jika items disediakan, update items
      if (items !== undefined) {
        // Hapus items yang ada
        await tx.vocabularyItem.deleteMany({
          where: { collectionId: id }
        })

        // Buat items baru
        if (items.length > 0) {
          await tx.vocabularyItem.createMany({
            data: items.map(item => ({
              ...item,
              collectionId: id
            }))
          })
        }
      }

      return updatedCollection
    })
    
    revalidatePath("/vocabulary")
    return { success: true, data: updated }
  } catch (error) {
    console.error("[UPDATE_VOCABULARY_COLLECTION]", error)
    return { success: false, error: "Gagal memperbarui kumpulan kosakata" }
  }
}

export async function deleteVocabularyCollection(id: number) {
  try {
    const user = await currentUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const collection = await db.vocabularyCollection.findFirst({
      where: { id, userId: user.id }
    })
    if (!collection) return { success: false, error: "Kumpulan kosakata tidak ditemukan" }

    // Gunakan transaction untuk menghapus items dan collection
    await db.$transaction(async (tx) => {
      // Hapus semua items terlebih dahulu
      await tx.vocabularyItem.deleteMany({
        where: { collectionId: id }
      })

      // Kemudian hapus collection
      await tx.vocabularyCollection.delete({
        where: { id }
      })
    })
    
    revalidatePath("/vocabulary")
    return { success: true }
  } catch (error) {
    console.error("[DELETE_VOCABULARY_COLLECTION]", error)
    return { success: false, error: "Gagal menghapus kumpulan kosakata" }
  }
}

export async function getVocabularyItems(
  collectionId: number,
  vocabularyType?: "WORD" | "SENTENCE"
) {
  try {
    const user = await currentUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const collection = await db.vocabularyCollection.findFirst({
      where: {
        id: collectionId,
        OR: [
          { userId: user.id },
          { isPublic: true }
        ]
      }
    })
    if (!collection) return { success: false, error: "Kumpulan kosakata tidak ditemukan" }

    const items = await db.vocabularyItem.findMany({
      where: {
        collectionId,
        ...(vocabularyType ? { type: vocabularyType } : {})
      },
      orderBy: { createdAt: 'desc' }
    })
    
    return { success: true, data: items }
  } catch (error) {
    console.error("[GET_VOCABULARY_ITEMS]", error)
    return { success: false, error: "Gagal mengambil kosakata" }
  }
}

export async function searchVocabularyItems(query: string) {
  try {
    const user = await currentUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const items = await db.vocabularyItem.findMany({
      where: {
        OR: [
          { korean: { contains: query, mode: 'insensitive' } },
          { indonesian: { contains: query, mode: 'insensitive' } },
        ],
        collection: {
          OR: [
            { userId: user.id },
            { isPublic: true }
          ]
        }
      },
      include: {
        collection: {
          select: {
            title: true
          }
        }
      },
      take: 50
    })
    
    return { success: true, data: items }
  } catch (error) {
    console.error("[SEARCH_VOCABULARY_ITEMS]", error)
    return { success: false, error: "Gagal mencari kosakata" }
  }
}

export async function deleteVocabularyItem(id: number) {
  try {
    const user = await currentUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const item = await db.vocabularyItem.findUnique({
      where: { id },
      include: { collection: true }
    })
    if (!item || (!item.collection.isPublic && item.collection.userId !== user.id)) {
      return { success: false, error: "Kosakata tidak ditemukan" }
    }

    await db.vocabularyItem.delete({ where: { id } })
    
    revalidatePath("/vocabulary")
    return { success: true }
  } catch (error) {
    console.error("[DELETE_VOCABULARY_ITEM]", error)
    return { success: false, error: "Gagal menghapus kosakata" }
  }
}

export async function getLatestVocabularyCollections() {
  try {
    const user = await currentUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const collections = await db.vocabularyCollection.findMany({
      where: {
        userId: user.id // Only get collections owned by the user
      },
      include: {
        items: {
          select: {
            id: true,
            korean: true,
            indonesian: true,
            isChecked: true,
            type: true,
            createdAt: true,
            updatedAt: true,
            collectionId: true
          }
        },
        user: {
          select: {
            name: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 3 // Only get latest 3 collections
    })
    
    return { success: true, data: collections }
  } catch (error) {
    console.error("[GET_USER_VOCABULARY_COLLECTIONS]", error)
    return { success: false, error: "Gagal mengambil kumpulan kosakata pengguna" }
  }
}

export async function getRandomVocabularies() {
  try {
    const user = await currentUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const items = await db.$queryRaw<VocabularyItem[]>`
      SELECT v.* 
      FROM "VocabularyItem" v
      JOIN "VocabularyCollection" c ON v."collectionId" = c.id
      WHERE v.type = 'WORD'
      AND (c."userId" = ${user.id} OR c."isPublic" = true)
      ORDER BY RANDOM()
      LIMIT 20
    `
    
    return { success: true, data: items }
  } catch (error) {
    console.error("[GET_RANDOM_VOCABULARIES]", error)
    return { success: false, error: "Gagal mengambil kosakata acak" }
  }
}

export async function toggleVocabularyItemCheck(id: number) {
  try {
    const user = await currentUser()
    if (!user) return { success: false, error: "Unauthorized" }

    // Get the item and its collection to check permissions
    const item = await db.vocabularyItem.findUnique({
      where: { id },
      include: { collection: true }
    })

    if (!item) {
      return { success: false, error: "Kosakata tidak ditemukan" }
    }

    // Check if user owns the collection or if it's public
    if (!item.collection.isPublic && item.collection.userId !== user.id) {
      return { success: false, error: "Tidak memiliki akses" }
    }

    // Toggle the isChecked state
    const updatedItem = await db.vocabularyItem.update({
      where: { id },
      data: { isChecked: !item.isChecked }
    })

    revalidatePath("/vocabulary")
    return { success: true, data: updatedItem }
  } catch (error) {
    console.error("[TOGGLE_VOCABULARY_ITEM]", error)
    return { success: false, error: "Gagal mengupdate status kosakata" }
  }
}
