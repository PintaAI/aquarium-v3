"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Book } from "lucide-react"
import { getVocabularyCollections } from "@/actions/vocabulary-actions"
import { UseCurrentUser } from "@/hooks/use-current-user"

interface VocabularyItem {
  id: number
  korean: string
  indonesian: string
  createdAt: Date
  updatedAt: Date
  collectionId: number
}

interface VocabularyCollection {
  id: number
  title: string
  description: string | null
  isPublic: boolean
  items: VocabularyItem[]
  user: {
    name: string | null
    role: "USER" | "GURU" | "MURID" | "ADMIN"
  } | null
  createdAt: Date
  updatedAt: Date
  userId: string | null
}

export function VocabularySidebarContent() {
  const [collections, setCollections] = useState<VocabularyCollection[]>([])
  const user = UseCurrentUser()

  useEffect(() => {
    const fetchCollections = async () => {
      if (!user) return
      
      const result = await getVocabularyCollections()
      if (result.success && result.data) {
        // Filter hanya koleksi milik user saat ini
        const userCollections = result.data.filter(collection => 
          collection.userId === user.id
        )
        setCollections(userCollections)
      }
    }
    fetchCollections()
  }, [user])

  if (!user) {
    return (
      <div className="flex items-center justify-center p-6 text-sm text-muted-foreground">
        <div className="text-center">
          <Book className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-2">Silakan login untuk melihat koleksi kosakata Anda</p>
        </div>
      </div>
    )
  }

  if (collections.length === 0) {
    return (
      <div className="flex items-center justify-center p-6 text-sm text-muted-foreground">
        <div className="text-center">
          <Book className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-2">Anda belum memiliki koleksi kosakata</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-1.5 p-1.5">
      {collections.map((collection) => {
        const itemCount = collection.items.length
        const firstItem = collection.items[0]

        return (
          <Link
            href={`/vocabulary/${collection.id}`}
            key={collection.id}
            className="group relative block overflow-hidden rounded-lg transition-all duration-200 hover:ring-2 hover:ring-primary/20 active:scale-[0.98]"
          >
            <div className="relative w-full p-4 bg-card">
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="px-1.5 py-0.5 rounded-md bg-primary/20 backdrop-blur-sm text-[10px] font-medium text-primary-foreground">
                  {itemCount} Kata
                </div>
              </div>

              {/* Content */}
              <div>
                <h3 className="text-sm font-medium leading-tight text-foreground mb-1">
                  {collection.title}
                </h3>

                {firstItem && (
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <Book className="h-3 w-3" />
                    <span className="truncate">{firstItem.korean} - {firstItem.indonesian}</span>
                  </div>
                )}

                {collection.description && (
                  <p className="mt-1 text-[10px] text-muted-foreground line-clamp-1">
                    {collection.description}
                  </p>
                )}
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
