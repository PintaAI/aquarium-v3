"use server"

import { db } from "@/lib/db"
import { currentUser } from "@/lib/auth"
import { VocabularyType } from "@prisma/client"

export async function getFlashcardWords(collectionId?: number) {
  try {
    const user = await currentUser()
    if (!user) {
      return { success: false, error: "Unauthorized" }
    }

    // Only fetch WORD type items
    const words = await db.vocabularyItem.findMany({
      where: {
        type: VocabularyType.WORD,
        collection: {
          OR: [
            { userId: user.id },
            { isPublic: true }
          ],
          ...(collectionId && { id: collectionId })
        }
      },
      select: {
        id: true,
        korean: true,
        indonesian: true,
        isChecked: true
      },
      orderBy: collectionId ? { id: 'asc' } : { updatedAt: 'desc' },
      take: collectionId ? undefined : 100
    })

    return { success: true, data: words }
  } catch (error) {
    console.error("[GET_FLASHCARD_WORDS]", error)
    return { success: false, error: "Failed to fetch flashcard words" }
  }
}

export async function getCollections() {
  try {
    const user = await currentUser()
    if (!user) {
      return { success: false, error: "Unauthorized" }
    }

    const collections = await db.vocabularyCollection.findMany({
      where: {
        OR: [
          { userId: user.id },
          { isPublic: true }
        ]
      },
      select: {
        id: true,
        title: true,
        icon: true,
        _count: {
          select: {
            items: {
              where: {
                type: VocabularyType.WORD
              }
            }
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return { success: true, data: collections }
  } catch (error) {
    console.error("[GET_COLLECTIONS]", error)
    return { success: false, error: "Failed to fetch collections" }
  }
}
