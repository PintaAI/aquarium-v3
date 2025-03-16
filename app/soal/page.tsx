"use client"

import Link from "next/link"
import { Plus } from "lucide-react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { SoalCard } from "@/components/card/soal-card"
import { getKoleksiSoals, deleteKoleksiSoal } from "../actions/soal-actions"
import { Difficulty } from "@prisma/client"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Opsi {
  id: number
  opsiText: string
  isCorrect: boolean
  createdAt: Date
  updatedAt: Date
  soalId: number
}

interface Author {
  id: string
  name: string | null
  role: string
}

interface Soal {
  id: number
  koleksiId: number
  authorId: string
  pertanyaan: string
  attachmentUrl: string | null
  attachmentType: string | null
  difficulty: Difficulty | null
  explanation: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  opsis: Opsi[]
  author: Author
}

interface KoleksiSoal {
  id: number
  nama: string
  deskripsi: string | null
  createdAt: Date
  updatedAt: Date
  soals: Soal[]
}

export default function SoalPage() {
  const router = useRouter()
  const [collections, setCollections] = useState<KoleksiSoal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadCollections = async () => {
    try {
      const result = await getKoleksiSoals()
      if (result.success && result.data) {
        setCollections(result.data)
      }
      setIsLoading(false)
    } catch (error) {
      console.error("Failed to load collections:", error)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCollections()
  }, [])

  if (isLoading) {
    return (
      <div className="container max-w-5xl mx-auto p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-4 h-[200px] animate-pulse bg-accent/50" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="container max-w-5xl mx-auto p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-foreground">Koleksi Soal</h1>
          <Link href="/soal/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Koleksi
            </Button>
          </Link>
        </div>

        {collections.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-4">
              Belum ada koleksi soal yang dibuat
            </p>
            <Link href="/soal/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Buat Koleksi Pertama
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {collections.map((collection) => (
              <SoalCard
                key={collection.id}
                id={collection.id}
                title={collection.nama}
                description={collection.deskripsi}
                user={collection.soals[0]?.author}
                soals={collection.soals}
                onClick={() => router.push(`/soal/${collection.id}/test`)}
                onEdit={() => router.push(`/soal/${collection.id}/edit`)}
                onDelete={() => setDeleteId(collection.id)}
              />
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Koleksi Soal</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus koleksi soal ini? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={async () => {
                if (!deleteId) return
                setIsDeleting(true)
                const result = await deleteKoleksiSoal(deleteId)
                if (result.success) {
                  toast.success("Koleksi soal berhasil dihapus")
                  await loadCollections()
                } else {
                  toast.error(result.error || "Terjadi kesalahan")
                }
                setIsDeleting(false)
                setDeleteId(null)
              }}
            >
              {isDeleting ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
