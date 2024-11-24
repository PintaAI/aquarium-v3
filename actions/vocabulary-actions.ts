"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { currentUser } from "@/lib/auth"

// Collection Actions
export async function createVocabularyCollection(title: string, description?: string) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return { success: false, error: "Unauthorized" }
    }

    const collection = await db.vocabularyCollection.create({
      data: {
        title,
        description,
        userId: user.id
      }
    })
    
    revalidatePath("/vocabulary")
    return { success: true, data: collection }
  } catch (error) {
    console.error("Error creating vocabulary collection:", error)
    return { success: false, error: "Gagal membuat kumpulan kosakata" }
  }
}

export async function getVocabularyCollections() {
  try {
    const user = await currentUser()
    
    if (!user) {
      return { success: false, error: "Unauthorized" }
    }

    const collections = await db.vocabularyCollection.findMany({
      where: { userId: user.id },
      include: {
        items: true
      }
    })
    
    return { success: true, data: collections }
  } catch (error) {
    console.error("Error getting vocabulary collections:", error)
    return { success: false, error: "Gagal mengambil kumpulan kosakata" }
  }
}

export async function updateVocabularyCollection(id: number, title: string, description?: string) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return { success: false, error: "Unauthorized" }
    }

    // Verify ownership
    const collection = await db.vocabularyCollection.findFirst({
      where: { id, userId: user.id }
    })

    if (!collection) {
      return { success: false, error: "Kumpulan kosakata tidak ditemukan" }
    }

    const updated = await db.vocabularyCollection.update({
      where: { id },
      data: {
        title,
        description
      }
    })
    
    revalidatePath("/vocabulary")
    return { success: true, data: updated }
  } catch (error) {
    console.error("Error updating vocabulary collection:", error)
    return { success: false, error: "Gagal memperbarui kumpulan kosakata" }
  }
}

export async function deleteVocabularyCollection(id: number) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return { success: false, error: "Unauthorized" }
    }

    // Verify ownership
    const collection = await db.vocabularyCollection.findFirst({
      where: { id, userId: user.id }
    })

    if (!collection) {
      return { success: false, error: "Kumpulan kosakata tidak ditemukan" }
    }

    await db.vocabularyCollection.delete({
      where: { id }
    })
    
    revalidatePath("/vocabulary")
    return { success: true }
  } catch (error) {
    console.error("Error deleting vocabulary collection:", error)
    return { success: false, error: "Gagal menghapus kumpulan kosakata" }
  }
}

// Vocabulary Item Actions
export async function createVocabularyItem(
  collectionId: number,
  korean: string,
  indonesian: string,
  category: string
) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return { success: false, error: "Unauthorized" }
    }

    // Verify collection ownership
    const collection = await db.vocabularyCollection.findFirst({
      where: { id: collectionId, userId: user.id }
    })

    if (!collection) {
      return { success: false, error: "Kumpulan kosakata tidak ditemukan" }
    }

    const item = await db.vocabularyItem.create({
      data: {
        korean,
        indonesian,
        category,
        collectionId
      }
    })
    
    revalidatePath("/vocabulary")
    return { success: true, data: item }
  } catch (error) {
    console.error("Error creating vocabulary item:", error)
    return { success: false, error: "Gagal menambah kosakata" }
  }
}

export async function getVocabularyItems(collectionId: number) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return { success: false, error: "Unauthorized" }
    }

    // Verify collection ownership
    const collection = await db.vocabularyCollection.findFirst({
      where: { id: collectionId, userId: user.id }
    })

    if (!collection) {
      return { success: false, error: "Kumpulan kosakata tidak ditemukan" }
    }

    const items = await db.vocabularyItem.findMany({
      where: { collectionId }
    })
    
    return { success: true, data: items }
  } catch (error) {
    console.error("Error getting vocabulary items:", error)
    return { success: false, error: "Gagal mengambil kosakata" }
  }
}

export async function updateVocabularyItem(
  id: number,
  korean: string,
  indonesian: string,
  category: string
) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return { success: false, error: "Unauthorized" }
    }

    // Verify item ownership through collection
    const item = await db.vocabularyItem.findUnique({
      where: { id },
      include: { collection: true }
    })

    if (!item || item.collection.userId !== user.id) {
      return { success: false, error: "Kosakata tidak ditemukan" }
    }

    const updated = await db.vocabularyItem.update({
      where: { id },
      data: {
        korean,
        indonesian,
        category
      }
    })
    
    revalidatePath("/vocabulary")
    return { success: true, data: updated }
  } catch (error) {
    console.error("Error updating vocabulary item:", error)
    return { success: false, error: "Gagal memperbarui kosakata" }
  }
}

export async function deleteVocabularyItem(id: number) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return { success: false, error: "Unauthorized" }
    }

    // Verify item ownership through collection
    const item = await db.vocabularyItem.findUnique({
      where: { id },
      include: { collection: true }
    })

    if (!item || item.collection.userId !== user.id) {
      return { success: false, error: "Kosakata tidak ditemukan" }
    }

    await db.vocabularyItem.delete({
      where: { id }
    })
    
    revalidatePath("/vocabulary")
    return { success: true }
  } catch (error) {
    console.error("Error deleting vocabulary item:", error)
    return { success: false, error: "Gagal menghapus kosakata" }
  }
}
