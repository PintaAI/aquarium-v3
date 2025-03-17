"use client"

import { useState } from "react"
import { Difficulty } from "@prisma/client"
import { Plus, Upload, X, FileText, Image as ImageIcon, Volume2, Medal, HelpCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
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
import Image from "next/image"

// Props for the dialog component
interface AddSoalDialogProps {
  currentPertanyaan: string
  setCurrentPertanyaan: (value: string) => void
  currentAttachmentUrl: string
  setCurrentAttachmentUrl: (value: string) => void
  currentAttachmentType: "IMAGE" | "AUDIO" | undefined
  setCurrentAttachmentType: (value: "IMAGE" | "AUDIO" | undefined) => void
  currentDifficulty: Difficulty | undefined
  setCurrentDifficulty: (value: Difficulty | undefined) => void
  currentExplanation: string
  setCurrentExplanation: (value: string) => void
  currentOpsis: { opsiText: string; isCorrect: boolean }[]
  setCurrentOpsis: (value: { opsiText: string; isCorrect: boolean }[]) => void
  newOpsiText: string
  setNewOpsiText: (value: string) => void
  isUploading: boolean
  handleAddOpsi: () => void
  handleRemoveOpsi: (index: number) => void
  handleToggleCorrect: (index: number) => void
  handleAddSoal: () => void
  handleFileUpload: (file: File) => void
}

export function AddSoalDialog({
  currentPertanyaan,
  setCurrentPertanyaan,
  currentAttachmentUrl,
  setCurrentAttachmentUrl,
  currentAttachmentType,
  setCurrentAttachmentType,
  currentDifficulty,
  setCurrentDifficulty,
  currentExplanation,
  setCurrentExplanation,
  currentOpsis,
  setCurrentOpsis,
  newOpsiText,
  setNewOpsiText,
  isUploading,
  handleAddOpsi,
  handleRemoveOpsi,
  handleToggleCorrect,
  handleAddSoal,
  handleFileUpload
}: AddSoalDialogProps) {
  const [open, setOpen] = useState(false)

  const handleSubmit = () => {
    if (currentPertanyaan && currentOpsis.length > 0 && currentDifficulty) {
      // First add the soal to ensure data is saved before form is reset
      handleAddSoal()
      
      // Now close the dialog (form fields will be reset by the onOpenChange handler)
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) { // Dialog is closing, reset form fields
        setCurrentPertanyaan("")
        setCurrentAttachmentUrl("")
        setCurrentAttachmentType(undefined)
        setCurrentDifficulty(undefined)
        setCurrentExplanation("")
        setCurrentOpsis([])
        setNewOpsiText("")
      }
      setOpen(open)
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full bg-accent/10 border-dashed border-2">
          <Plus className="h-4 w-4 mr-2" />
          Tambah Soal Baru
        </Button>
      </DialogTrigger>
      <DialogContent className="!max-w-4xl max-h-[90vh] sm:!max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Tambah Soal Baru</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[calc(90vh-8rem)] p-4">
          <div>
            <div className="space-y-4 p-2">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Pertanyaan
                </Label>
                <Textarea
                  value={currentPertanyaan}
                  onChange={(e) => setCurrentPertanyaan(e.target.value)}
                  placeholder="Tuliskan pertanyaan disini"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Lampiran
                  </Label>
                  <Select
                    value={currentAttachmentType || ""}
                    onValueChange={(value: "IMAGE" | "AUDIO") => setCurrentAttachmentType(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih tipe lampiran" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IMAGE">
                        <span className="flex items-center gap-2">
                          <ImageIcon className="w-4 h-4" />
                          Gambar
                        </span>
                      </SelectItem>
                      <SelectItem value="AUDIO">
                        <span className="flex items-center gap-2">
                          <Volume2 className="w-4 h-4" />
                          Audio
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  {currentAttachmentType && (
                    <>
                      {currentAttachmentUrl && (
                        <div className="rounded-md overflow-hidden bg-accent/20 p-2">
                          {currentAttachmentType === "IMAGE" ? (
                            <Image
                              src={currentAttachmentUrl}
                              alt="Preview"
                              width={200}
                              height={200}
                              className="rounded-md object-contain"
                            />
                          ) : (
                            <audio
                              src={currentAttachmentUrl}
                              controls
                              className="w-full max-w-[300px]"
                            />
                          )}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept={currentAttachmentType === "IMAGE" ? "image/*" : "audio/*"}
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              handleFileUpload(file)
                            }
                          }}
                          disabled={isUploading}
                        />
                        {isUploading && (
                          <Button disabled variant="outline" size="sm">
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Mengunggah...
                          </Button>
                        )}
                      </div>
                    </>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Medal className="w-4 h-4" />
                    Tingkat Kesulitan
                  </Label>
                  <Select
                    value={currentDifficulty || ""}
                    onValueChange={(value: Difficulty) => setCurrentDifficulty(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih tingkat kesulitan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BEGINNER">
                        <span className="flex items-center gap-2">Mudah</span>
                      </SelectItem>
                      <SelectItem value="INTERMEDIATE">
                        <span className="flex items-center gap-2">Menengah</span>
                      </SelectItem>
                      <SelectItem value="ADVANCED">
                        <span className="flex items-center gap-2">Sulit</span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-4 p-2">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  Penjelasan (Opsional)
                </Label>
                <Textarea
                  value={currentExplanation}
                  onChange={(e) => setCurrentExplanation(e.target.value)}
                  placeholder="Penjelasan jawaban yang benar"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Opsi Jawaban
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={newOpsiText}
                    onChange={(e) => setNewOpsiText(e.target.value)}
                    placeholder="Tulis opsi jawaban"
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleAddOpsi()
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={handleAddOpsi}
                    variant="secondary"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah
                  </Button>
                </div>

                <div className="space-y-2">
                  {currentOpsis.map((opsi, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 bg-accent/20 hover:bg-accent/30 rounded-lg transition-colors"
                    >
                      <Button
                        type="button"
                        onClick={() => handleToggleCorrect(index)}
                        variant={opsi.isCorrect ? "default" : "outline"}
                        size="sm"
                      >
                        {opsi.isCorrect ? "Benar" : "Salah"}
                      </Button>
                      <span className="flex-1">{opsi.opsiText}</span>
                      <Button
                        type="button"
                        onClick={() => handleRemoveOpsi(index)}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Hapus</span>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button" 
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={!currentPertanyaan || currentOpsis.length === 0 || !currentDifficulty}
                >
                  Tambah Soal
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
