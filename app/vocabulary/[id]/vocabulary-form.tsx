"use client"

import { createVocabularyItem } from "@/actions/vocabulary-actions"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface VocabularyFormProps {
  collectionId: number
}

export default function VocabularyForm({ collectionId }: VocabularyFormProps) {
  const router = useRouter()
  const [korean, setKorean] = useState("")
  const [indonesian, setIndonesian] = useState("")
  const [category, setCategory] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await createVocabularyItem(
        collectionId,
        korean,
        indonesian,
        category
      )
      
      if (result.success) {
        // Reset form
        setKorean("")
        setIndonesian("")
        setCategory("")
        // Refresh data
        router.refresh()
      } else {
        setError(result.error || "Terjadi kesalahan")
      }
    } catch (err) {
      setError("Terjadi kesalahan saat menambah kosakata")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label 
            htmlFor="korean" 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Kata Korea
          </label>
          <input
            type="text"
            id="korean"
            value={korean}
            onChange={(e) => setKorean(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="예: 안녕하세요"
            required
          />
        </div>

        <div>
          <label 
            htmlFor="indonesian" 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Arti Indonesia
          </label>
          <input
            type="text"
            id="indonesian"
            value={indonesian}
            onChange={(e) => setIndonesian(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Contoh: Halo"
            required
          />
        </div>

        <div>
          <label 
            htmlFor="category" 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Kategori
          </label>
          <input
            type="text"
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Contoh: Salam"
            required
          />
        </div>

        <div className="md:col-span-3">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {isLoading ? "Menyimpan..." : "Tambah Kosakata"}
          </button>
        </div>
      </form>
    </div>
  )
}
