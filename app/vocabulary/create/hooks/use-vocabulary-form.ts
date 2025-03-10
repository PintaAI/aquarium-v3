"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { 
  createVocabularyCollection, 
  updateVocabularyCollection, 
  deleteVocabularyCollection 
} from "@/app/actions/vocabulary-actions"

interface VocabularyFormProps {
  initialData?: {
    id: number
    title: string
    description?: string | null
    items: {
      korean: string
      indonesian: string
      type: "WORD" | "SENTENCE"
    }[]
  }
}

export function useVocabularyForm(props?: VocabularyFormProps) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [title, setTitle] = useState(props?.initialData?.title ?? "")
  const [description, setDescription] = useState(props?.initialData?.description ?? "")
  const [items, setItems] = useState(props?.initialData?.items ?? [])
  const [newKorean, setNewKorean] = useState("")
  const [newIndonesian, setNewIndonesian] = useState("")
  const [selectedType, setSelectedType] = useState<"WORD" | "SENTENCE">("WORD")

  const isEdit = !!props?.initialData

  const handleAddItem = () => {
    if (newKorean && newIndonesian) {
      setItems([
        ...items,
        {
          korean: newKorean,
          indonesian: newIndonesian,
          type: selectedType
        }
      ])
      setNewKorean("")
      setNewIndonesian("")
    }
  }

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const formAction = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isPending) return

    try {
      setIsPending(true)
      
      if (isEdit && props?.initialData?.id) {
        await updateVocabularyCollection(
          props.initialData.id,
          title,
          description || undefined,
          items
        )
      } else {
        await createVocabularyCollection(
          title,
          description || undefined,
          items
        )
      }

      router.push("/vocabulary")
      router.refresh()
    } catch (error) {
      console.error(error)
    } finally {
      setIsPending(false)
    }
  }

  const deleteAction = async () => {
    if (!props?.initialData?.id || isPending) return
    if (!confirm("Yakin ingin menghapus kumpulan kosakata ini?")) return

    try {
      setIsPending(true)
      await deleteVocabularyCollection(props.initialData.id)
      router.push("/vocabulary")
      router.refresh()
    } catch (error) {
      console.error(error)
    } finally {
      setIsPending(false)
    }
  }

  return {
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
    selectedType,
    setSelectedType,
    formAction,
    deleteAction,
    handleAddItem,
    handleRemoveItem,
  }
}
