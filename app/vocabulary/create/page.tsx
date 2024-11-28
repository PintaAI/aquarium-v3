"use client"

import { createVocabularyCollection, updateVocabularyCollection, deleteVocabularyCollection, getVocabularyCollection } from "@/actions/vocabulary-actions"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState, useTransition } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"

interface VocabularyItem {
  korean: string
  indonesian: string
}

export default function CreateVocabularyPage() {
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

  return (
    <div className="container max-w-5xl mx-auto p-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/vocabulary"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              ← Kembali
            </Link>
            <h1 className="text-2xl font-bold text-primary">
              {isEdit ? "Edit Kumpulan Kosakata" : "Buat Kumpulan Kosakata Baru"}
            </h1>
          </div>
          {isEdit && (
            <Button
              type="button"
              onClick={deleteAction}
              disabled={isPending}
              variant="destructive"
            >
              Hapus
            </Button>
          )}
        </div>

        <form onSubmit={formAction} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label 
                htmlFor="title" 
                className="block text-sm font-medium text-foreground mb-1"
              >
                Judul Kumpulan
              </label>
              <Input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Kosakata Makanan"
                required
                className="w-full"
              />
            </div>

            <div>
              <label 
                htmlFor="description" 
                className="block text-sm font-medium text-foreground mb-1"
              >
                Deskripsi (Opsional)
              </label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Deskripsi singkat tentang kumpulan kosakata ini"
                rows={3}
                className="w-full"
              />
            </div>
          </div>

          {/* Form untuk menambah kosakata */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Daftar Kosakata</h2>
            
            {/* Input kosakata baru */}
            <div className="flex gap-2">
              <Input
                type="text"
                value={newKorean}
                onChange={(e) => setNewKorean(e.target.value)}
                placeholder="Kata Korea"
                className="flex-1"
              />
              <Input
                type="text"
                value={newIndonesian}
                onChange={(e) => setNewIndonesian(e.target.value)}
                placeholder="Arti Indonesia"
                className="flex-1"
              />
              <Button 
                type="button"
                onClick={handleAddItem}
                variant="secondary"
              >
                Tambah
              </Button>
            </div>

            {/* Daftar kosakata yang sudah ditambahkan */}
            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-accent rounded">
                  <span className="flex-1">{item.korean}</span>
                  <span className="flex-1">{item.indonesian}</span>
                  <Button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                  >
                    Hapus
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isPending ? "Menyimpan..." : isEdit ? "Perbarui" : "Simpan"}
            </Button>
            
            <Link href="/vocabulary">
              <Button
                type="button"
                variant="outline"
                className="border-input hover:bg-accent"
              >
                Batal
              </Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  )
}
