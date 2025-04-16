"use client";

import { useEffect, useState } from 'react';
import { getGameVocabularies } from '@/app/actions/vocabulary-actions';

export interface VocabularyItem {
  korean: string;
  english: string;  // This will contain Indonesian text
}

export function useVocabularyData(collectionId?: number) {
  const [vocabularies, setVocabularies] = useState<VocabularyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadVocabularies() {
      try {
        const result = await getGameVocabularies(collectionId);
        if (!result.success) {
          throw new Error(result.error);
        }
        setVocabularies(result.data || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load vocabularies');
      } finally {
        setLoading(false);
      }
    }

    loadVocabularies();
  }, [collectionId]);

  return {
    vocabularies,
    loading,
    error
  };
}
