"use client"

import { createVocabularyCollection, updateVocabularyCollection, deleteVocabularyCollection, getVocabularyCollection } from "@/app/actions/vocabulary-actions"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState, useTransition } from "react"

interface VocabularyItem {
  korean: string
  indonesian: string
}

export function useVocabularyForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isEdit = searchParams.get("edit") === "true"
  const collectionId = searchParams.get("id")
  const [isPending, startTransition] = useTransition()
  
  // State untuk form
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  
  // State untuk menyimpan items
  const [items, setItems] = useState<VocabularyItem[]>([])
  const [newKorean, setNewKorean] = useState("")
  const [newIndonesian, setNewIndonesian] = useState("")

  useEffect(() => {
    if (isEdit && collectionId) {
      startTransition(async () => {
        const result = await getVocabularyCollection(parseInt(collectionId))
        if (result.success && result.data) {
          // Set state dengan data yang ada
          setTitle(result.data.title)
          setDescription(result.data.description || "")
          // Load items jika dalam mode edit
          setItems(result.data.items.map(item => ({
            korean: item.korean,
            indonesian: item.indonesian
          })))
        }
      })
    }
  }, [isEdit, collectionId])

  async function formAction(e: React.FormEvent) {
    e.preventDefault()

    // Validasi title tidak boleh kosong
    if (!title.trim()) {
      alert("Judul tidak boleh kosong")
      return
    }

    startTransition(async () => {
      let result
      if (isEdit && collectionId) {
        result = await updateVocabularyCollection(parseInt(collectionId), title, description, items)
      } else {
        result = await createVocabularyCollection(title, description, items)
      }
      
      if (result.success) {
        router.push("/vocabulary")
      }
    })
  }

  async function deleteAction() {
    if (!collectionId || !confirm("Apakah Anda yakin ingin menghapus kumpulan kosakata ini?")) {
      return
    }

    startTransition(async () => {
      const result = await deleteVocabularyCollection(parseInt(collectionId))
      if (result.success) {
        router.push("/vocabulary")
      }
    })
  }

  function handleAddItem(e: React.FormEvent) {
    e.preventDefault()
    if (newKorean && newIndonesian) {
      setItems([...items, { korean: newKorean, indonesian: newIndonesian }])
      setNewKorean("")
      setNewIndonesian("")
    }
  }

  function handleRemoveItem(index: number) {
    setItems(items.filter((_, i) => i !== index))
  }

  return {
    // State
    title,
    setTitle,
    description,
    setDescription,
    items,
    newKorean,
    setNewKorean,
    newIndonesian,
    setNewIndonesian,
    isPending,
    isEdit,
    
    // Actions
    formAction,
    deleteAction,
    handleAddItem,
    handleRemoveItem,
  }
}
