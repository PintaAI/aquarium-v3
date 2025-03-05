import { db } from "@/lib/db"

export async function getVocabularyCollections() {
  try {
    const collections = await db.vocabularyCollection.findMany({
      include: {
        user: {
          select: {
            name: true,
          },
        },
        items: {
          select: {
            id: true,
            isChecked: true,
          },
        },
      },
    })

    return collections.map(collection => ({
      ...collection,
      totalItems: collection.items.length,
      checkedItems: collection.items.filter(item => item.isChecked).length,
    }))
  } catch (error) {
    console.error("Error fetching vocabulary collections:", error)
    return []
  }
}

export async function getVocabularyCollection(id: number) {
  try {
    const collection = await db.vocabularyCollection.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
          },
        },
        items: true,
      },
    })

    if (!collection) {
      return null
    }

    return {
      ...collection,
      totalItems: collection.items.length,
      checkedItems: collection.items.filter(item => item.isChecked).length,
    }
  } catch (error) {
    console.error("Error fetching vocabulary collection:", error)
    return null
  }
}
