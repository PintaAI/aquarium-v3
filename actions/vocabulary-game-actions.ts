"use server"

import { db } from "@/lib/db"

export async function getPublicVocabularies() {
  try {
    const publicCollections = await db.vocabularyCollection.findMany({
      where: {
        isPublic: true
      },
      include: {
        items: true
      }
    })

    // Transform data ke format yang dibutuhkan game
    return publicCollections.map(collection => ({
      name: collection.title,
      words: collection.items.map(item => ({
        id: item.id,
        term: item.korean,
        definition: item.indonesian
      }))
    }))
  } catch (error) {
    console.error("Error fetching public vocabularies:", error)
    return []
  }
}
