"use server"

import { getRandomVocabularies } from "@/app/actions/vocabulary-actions"
import { KoreanWord } from "../constants"

export async function getGameWords(): Promise<KoreanWord[]> {
  const result = await getRandomVocabularies()
  
  if (!result.success || !result.data) {
    return [] // Return empty array if fetch fails or data is undefined
  }

  // Convert VocabularyItem to KoreanWord format
  return result.data.map(item => ({
    word: item.korean,
    meaning: item.indonesian
  }))
}
