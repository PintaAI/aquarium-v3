"use server"

import { db } from "@/lib/db"
import { currentUser } from "@/lib/auth"
import { VocabularyType } from "@prisma/client"

// Helper function to shuffle an array (Fisher-Yates algorithm)
function shuffleArray<T>(array: T[]): T[] {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
  return array;
}

export async function getMatchWords(count: number, collectionId?: number) {
  try {
    const user = await currentUser()
    if (!user) {
      return { success: false, error: "Unauthorized" }
    }

    // Fetch potential words
    const potentialWords = await db.vocabularyItem.findMany({
      where: {
        type: VocabularyType.WORD, // Ensure we only get words
        korean: { not: "" },     // Ensure Korean word is not an empty string
        indonesian: { not: "" }, // Ensure Indonesian meaning is not an empty string
        collection: {
          OR: [
            { userId: user.id },
            { isPublic: true }
          ],
          ...(collectionId && { id: collectionId }) // Filter by collection if ID is provided
        }
      },
      select: {
        id: true,
        korean: true,
        indonesian: true,
      },
    })

    // Shuffle the potential words
    const shuffledWords = shuffleArray(potentialWords);

    // Take the required number of words
    const selectedWords = shuffledWords.slice(0, count);

    if (selectedWords.length < count) {
      console.warn(`[GET_MATCH_WORDS] Could only fetch ${selectedWords.length} words, requested ${count}.`);
      // Optionally return an error or just the words found
      if (selectedWords.length === 0) {
        return { success: false, error: "No matching words found for the criteria." }
      }
    }

    // Format for the game: array of pairs [Korean, Indonesian]
    const wordPairs = selectedWords.flatMap(word => [
        { id: `${word.id}-ko`, content: word.korean!, type: 'korean', pairId: word.id },
        { id: `${word.id}-id`, content: word.indonesian!, type: 'indonesian', pairId: word.id }
    ]);

    // Shuffle the final pairs so Korean and Indonesian aren't adjacent
    const shuffledPairs = shuffleArray(wordPairs);

    return { success: true, data: shuffledPairs }
  } catch (error) {
    console.error("[GET_MATCH_WORDS]", error)
    return { success: false, error: "Failed to fetch words for the match game" }
  }
}

// Action to get collections (similar to flashcard, can be reused or copied)
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
        _count: { // Correctly include _count in the select
          select: {
            items: {
              where: {
                type: VocabularyType.WORD,
                korean: { not: "" }, // Ensure Korean word is not an empty string
                indonesian: { not: "" }, // Ensure Indonesian meaning is not an empty string
              }
            }
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

     // Filter out collections with fewer than a minimum number of pairs (e.g., 3 for easy mode)
     const minPairsRequired = 3; // Adjust as needed
     const validCollections = collections.filter(c => c._count.items >= minPairsRequired);


    return { success: true, data: validCollections }
  } catch (error) {
    console.error("[GET_COLLECTIONS_MATCHKOR]", error)
    return { success: false, error: "Failed to fetch collections" }
  }
}
