"use client"

import { useState, useTransition, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { 
  createVocabularyCollection, 
  deleteVocabularyCollection, 
  updateVocabularyCollection,
  getVocabularyCollection
} from "@/app/actions/vocabulary-actions"

interface VocabularyItem {
  korean: string
  indonesian: string
  type?: "WORD" | "SENTENCE"
}

export const useVocabularyForm = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  
  // Get collection ID from URL if editing
  const collectionId = searchParams.get("id")
  const isEdit = Boolean(collectionId)

  // Form states
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [icon, setIcon] = useState("FaBook")
  const [items, setItems] = useState<Array<VocabularyItem>>([])
  const [newKorean, setNewKorean] = useState("")
  const [newIndonesian, setNewIndonesian] = useState("")
  const [selectedType, setSelectedType] = useState<"WORD" | "SENTENCE">("WORD")

  // Load existing data if editing
  useEffect(() => {
    if (isEdit && collectionId) {
      const loadVocabulary = async () => {
        const result = await getVocabularyCollection(parseInt(collectionId))
        if (result.success && result.data) {
          setTitle(result.data.title)
          setDescription(result.data.description ?? "")
          setIcon(result.data.icon ?? "FaBook")
          setItems(result.data.items)
          if (result.data.items.length > 0) {
            setSelectedType(result.data.items[0].type)
          }
        }
      }
      loadVocabulary()
    }
  }, [collectionId, isEdit])

  // Handle type change
  const handleTypeChange = (newType: "WORD" | "SENTENCE") => {
    // Update all existing items to new type
    setItems(items => items.map(item => ({
      ...item,
      type: newType
    })))
    setSelectedType(newType)
  }

  // Add item handler
  const handleAddItem = () => {
    if (!newKorean || !newIndonesian) return
    setItems([...items, { korean: newKorean, indonesian: newIndonesian, type: selectedType }])
    setNewKorean("")
    setNewIndonesian("")
  }

  // Remove item handler
  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  // Form submission handler
  const formAction = async (e: React.FormEvent) => {
    e.preventDefault()
    if (items.length === 0) {
      toast.error("Tambahkan minimal satu kosakata")
      return
    }

    // Ensure all items have the current selected type
    const updatedItems = items.map(item => ({
      ...item,
      type: selectedType
    }))

    startTransition(async () => {
      try {
        if (isEdit && collectionId) {
          const result = await updateVocabularyCollection(parseInt(collectionId), title, description, updatedItems, icon)
          if (result.success) {
            toast.success("Kosakata berhasil diperbarui")
            router.push("/vocabulary")
            router.refresh()
          } else {
            toast.error(result.error || "Terjadi kesalahan")
          }
        } else {
          const result = await createVocabularyCollection(title, description, updatedItems, icon)
          if (result.success) {
            toast.success("Kosakata berhasil ditambahkan")
            router.push("/vocabulary")
            router.refresh()
          } else {
            toast.error(result.error || "Terjadi kesalahan")
          }
        }
      } catch {
        toast.error("Terjadi kesalahan")
      }
    })
  }

  // Delete handler
  const deleteAction = async () => {
    if (!collectionId) return

    startTransition(async () => {
      try {
        const result = await deleteVocabularyCollection(parseInt(collectionId))
        if (result.success) {
          toast.success("Kosakata berhasil dihapus")
          router.push("/vocabulary")
          router.refresh()
        } else {
          toast.error(result.error || "Terjadi kesalahan")
        }
      } catch {
        toast.error("Terjadi kesalahan")
      }
    })
  }

  return {
    title,
    setTitle,
    description,
    setDescription,
    icon,
    setIcon,
    items,
    newKorean,
    setNewKorean,
    newIndonesian,
    setNewIndonesian,
    isPending,
    isEdit,
    formAction,
    deleteAction,
    handleAddItem,
    handleRemoveItem,
    selectedType,
    handleTypeChange,
  }
}
