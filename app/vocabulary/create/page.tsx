"use client"

import Link from "next/link"
import { Plus, Trash2, X, Type, FileText, Book, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { IconPicker } from "@/components/ui/icon-picker"
import { useVocabularyForm } from "./hooks/use-vocabulary-form"

export default function CreateVocabularyPage() {
  const {
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
  } = useVocabularyForm()

  return (
    <div className="container max-w-5xl mx-auto p-4 md:p-6 min-h-[calc(100vh-4rem)]">
      <Card className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center">
            <h1 className="text-xl md:text-2xl font-bold text-primary">
              {isEdit ? "Edit Kosakata" : "Tambah Kosakata"}
            </h1>
          </div>
          {isEdit && (
            <Button
              type="button"
              onClick={deleteAction}
              disabled={isPending}
              variant="destructive"
              size="sm"
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>Hapus</span>
            </Button>
          )}
        </div>

        <form onSubmit={formAction} className="space-y-8">
          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <div className="flex-1">
                <label 
                  htmlFor="title" 
                  className="block text-sm font-medium text-foreground mb-1"
                >
                  Judul
                </label>
                <div className="relative">
                  <Type className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Contoh: Kosakata Makanan"
                    required
                    className="w-full pl-9"
                  />
                </div>
              </div>
              <div>
                <label 
                  htmlFor="icon" 
                  className="block text-sm font-medium text-foreground mb-1"
                >
                  Ikon
                </label>
                <IconPicker value={icon} onChange={setIcon} />
              </div>
            </div>

            <div>
              <label 
                htmlFor="description" 
                className="block text-sm font-medium text-foreground mb-1"
              >
                Deskripsi (Opsional)
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Deskripsi singkat tentang kumpulan kosakata ini"
                  rows={3}
                  className="w-full pl-9"
                />
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Form untuk menambah kosakata */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Book className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-lg font-semibold flex items-center gap-2 text-foreground">
              {selectedType === "WORD" ? "Daftar Kata" : "Daftar Kalimat"}
                <span className="text-sm font-normal text-muted-foreground">
                  ({items.length} {selectedType === "WORD" ? "kata" : "kalimat"})
                </span>
              </h2>
            </div>
            
          {/* Pemilih tipe kosakata */}
          <div className="mb-4">
            <Tabs 
              defaultValue="WORD" 
              value={selectedType} 
              onValueChange={(value) => handleTypeChange(value as "WORD" | "SENTENCE")} 
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                <TabsTrigger value="WORD" className="flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  <span>Kata</span>
                </TabsTrigger>
                <TabsTrigger value="SENTENCE" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>Kalimat</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Input kosakata baru */}
          <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 flex gap-2">
                <Input
                  type="text"
                  value={newKorean}
                  onChange={(e) => setNewKorean(e.target.value)}
                  placeholder={selectedType === "WORD" ? "Kata Korea" : "Kalimat Korea"}
                  className="flex-1"
                />
                <Input
                  type="text"
                  value={newIndonesian}
                  onChange={(e) => setNewIndonesian(e.target.value)}
                  placeholder={selectedType === "WORD" ? "Arti Indonesia" : "Terjemahan Indonesia"}
                  className="flex-1"
                />
              </div>
              <Button 
                type="button"
                onClick={handleAddItem}
                variant="secondary"
                className="w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Tambah
              </Button>
            </div>

            {/* Daftar kosakata yang sudah ditambahkan */}
            <Card className="border border-border bg-card/50">
              <ScrollArea className="h-[300px] w-full rounded-md">
                <div className="p-4 space-y-2">
                  {items.map((item, index) => (
                    <div 
                      key={index} 
                      className="flex items-center gap-2 p-3 bg-accent hover:bg-accent/80 rounded-lg transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.korean}</p>
                        <p className="text-sm text-muted-foreground truncate">{item.indonesian}</p>
                      </div>
                      <Button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Hapus</span>
                      </Button>
                    </div>
                  ))}
                  {items.length === 0 && (
                    <p className="text-center text-sm text-muted-foreground py-8">
                      Belum ada kosakata yang ditambahkan
                    </p>
                  )}
                </div>
              </ScrollArea>
            </Card>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-4">
            <Button
              type="submit"
              disabled={isPending}
              className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isPending ? "Menyimpan..." : isEdit ? "Perbarui" : "Simpan"}
            </Button>
            
            <Link href="/vocabulary">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto border-input hover:bg-accent"
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
