"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getKoleksiSoals, copySoalToCollection } from "@/app/actions/soal-actions"
import { toast } from "sonner"

interface CopySoalDialogProps {
  currentCollectionId: number
  onSuccess?: () => void
}

interface Soal {
  id: number
  pertanyaan: string
}

interface KoleksiSoal {
  id: number
  nama: string
  soals: Soal[]
}

export function CopySoalDialog({ currentCollectionId, onSuccess }: CopySoalDialogProps) {
  const [open, setOpen] = useState(false)
  const [collections, setCollections] = useState<KoleksiSoal[]>([])
  const [selectedCollection, setSelectedCollection] = useState<string>("")
  const [selectedSoals, setSelectedSoals] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const loadCollections = async () => {
    const result = await getKoleksiSoals()
    if (result.success && result.data) {
      setCollections(result.data.filter(c => c.id !== currentCollectionId))
    }
  }

  const handleCopy = async () => {
    if (!selectedCollection || selectedSoals.length === 0) {
      toast.error("Pilih koleksi dan soal terlebih dahulu")
      return
    }

    setIsLoading(true)
    const result = await copySoalToCollection(
      parseInt(selectedCollection),
      currentCollectionId,
      selectedSoals
    )

    if (result.success) {
      toast.success("Soal berhasil disalin")
      setOpen(false)
      onSuccess?.()
      // Reset state
      setSelectedCollection("")
      setSelectedSoals([])
    } else {
      toast.error(result.error || "Gagal menyalin soal")
    }
    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen)
      if (isOpen) loadCollections()
    }}>
      <DialogTrigger asChild>
        <Button variant="outline">Salin Soal dari Koleksi Lain</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Salin Soal</DialogTitle>
          <DialogDescription>
            Pilih soal dari koleksi lain untuk disalin ke koleksi ini
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Pilih Koleksi Sumber</Label>
            <Select
              value={selectedCollection}
              onValueChange={(value) => {
                setSelectedCollection(value)
                setSelectedSoals([])
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih koleksi soal" />
              </SelectTrigger>
              <SelectContent>
                {collections.map((collection) => (
                  <SelectItem key={collection.id} value={collection.id.toString()}>
                    {collection.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedCollection && (
            <div className="space-y-2">
              <Label>Pilih Soal</Label>
              <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                <div className="space-y-2">
                  {collections
                    .find(c => c.id.toString() === selectedCollection)
                    ?.soals.map((soal) => (
                      <div key={soal.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`soal-${soal.id}`}
                          checked={selectedSoals.includes(soal.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedSoals([...selectedSoals, soal.id])
                            } else {
                              setSelectedSoals(selectedSoals.filter(id => id !== soal.id))
                            }
                          }}
                        />
                        <Label htmlFor={`soal-${soal.id}`} className="line-clamp-2">
                          {soal.pertanyaan}
                        </Label>
                      </div>
                    ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Batal
          </Button>
          <Button onClick={handleCopy} disabled={isLoading || !selectedCollection || selectedSoals.length === 0}>
            {isLoading ? "Menyalin..." : "Salin Soal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
