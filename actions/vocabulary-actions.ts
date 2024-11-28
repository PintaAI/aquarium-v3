"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { currentUser } from "@/lib/auth"

interface VocabularyItem {
  korean: string
  indonesian: string
}

// Collection Actions
export async function createVocabularyCollection(
  title: string, 
  description: string | undefined,
  items: VocabularyItem[] = []
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
            collectionId: collection.id
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
        items: true,
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
  items?: VocabularyItem[]
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

export async function getVocabularyItems(collectionId: number) {
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
      where: { collectionId },
      orderBy: { createdAt: 'desc' }
    })
    
    return { success: true, data: items }
  } catch (error) {
    console.error("[GET_VOCABULARY_ITEMS]", error)
    return { success: false, error: "Gagal mengambil kosakata" }
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
