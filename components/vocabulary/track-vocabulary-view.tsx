"use client"

import { useEffect } from "react"
import { addToRecentVocabulary } from "@/lib/recent-vocabulary"

import { RecentVocabulary } from "@/lib/recent-vocabulary"

interface TrackVocabularyViewProps {
  vocabulary: Omit<RecentVocabulary, 'lastAccessed'>
  children: React.ReactNode
}

export function TrackVocabularyView({ vocabulary, children }: TrackVocabularyViewProps) {
  useEffect(() => {
    // Track the view when component mounts
    addToRecentVocabulary({
      ...vocabulary,
      lastAccessed: new Date()
    })
  }, [vocabulary])

  return <>{children}</>
}
