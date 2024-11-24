"use client"

import { deleteVocabularyItem, updateVocabularyItem } from "@/actions/vocabulary-actions"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface VocabularyItem {
  id: number
  korean: string
  indonesian: string
  category: string
}

interface VocabularyActionsProps {
  item: VocabularyItem
}

export default function VocabularyActions({ item }: VocabularyActionsProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [korean, setKorean] = useState(item.korean)
  const [indonesian, setIndonesian] = useState(item.indonesian)
  const [category, setCategory] = useState(item.category)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleUpdate = async () => {
    setIsLoading(true)
    setError("")

    try {
      const result = await updateVocabularyItem(
        item.id,
        korean,
        indonesian,
        category
      )
      
      if (result.success) {
        setIsEditing(false)
        router.refresh()
      } else {
        setError(result.error || "Terjadi kesalahan")
      }
    } catch (err) {
      setError("Terjadi kesalahan saat memperbarui kosakata")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus kosakata ini?")) {
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const result = await deleteVocabularyItem(item.id)
      
      if (result.success) {
        router.refresh()
      } else {
        setError(result.error || "Terjadi kesalahan")
      }
    } catch (err) {
      setError("Terjadi kesalahan saat menghapus kosakata")
    } finally {
      setIsLoading(false)
    }
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={korean}
          onChange={(e) => setKorean(e.target.value)}
          className="w-24 px-2 py-1 border rounded text-sm"
          placeholder="Korea"
        />
        <input
          type="text"
          value={indonesian}
          onChange={(e) => setIndonesian(e.target.value)}
          className="w-24 px-2 py-1 border rounded text-sm"
          placeholder="Indonesia"
        />
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-24 px-2 py-1 border rounded text-sm"
          placeholder="Kategori"
        />
        <button
          onClick={handleUpdate}
          disabled={isLoading}
          className="text-green-500 hover:text-green-700 text-sm disabled:text-gray-400"
        >
          {isLoading ? "..." : "Simpan"}
        </button>
        <button
          onClick={() => setIsEditing(false)}
          className="text-gray-500 hover:text-gray-700 text-sm"
        >
          Batal
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setIsEditing(true)}
        disabled={isLoading}
        className="text-blue-500 hover:text-blue-700 text-sm"
      >
        Edit
      </button>
      <button
        onClick={handleDelete}
        disabled={isLoading}
        className="text-red-500 hover:text-red-700 text-sm"
      >
        Hapus
      </button>
      {error && <span className="text-red-500 text-sm">{error}</span>}
    </div>
  )
}
