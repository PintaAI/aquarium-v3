"use client"


import Link from "next/link"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { Book, FileText, HelpCircle, ListPlus, Lock, Trash2, X, GraduationCap, Volume2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { CopySoalDialog } from "../[id]/components/copy-soal-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AddSoalDialog } from "./components/add-soal-dialog"
import { useSoalForm } from "./hooks/use-soal-form"

const difficultyColors = {
  BEGINNER: "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20",
  INTERMEDIATE: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
  ADVANCED: "bg-red-500/10 text-red-500 hover:bg-red-500/20"
}

const difficultyLabels = {
  BEGINNER: "Mudah",
  INTERMEDIATE: "Menengah",
  ADVANCED: "Sulit"
}

const typeColors = {
  LISTENING: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
  READING: "bg-green-500/10 text-green-500 hover:bg-green-500/20"
}

const typeLabels = {
  LISTENING: "듣기 (Listening)",
  READING: "읽기 (Reading)"
}

export default function CreateSoalPage() {
  const searchParams = useSearchParams()
  const {
    nama,
    setNama,
    deskripsi,
    setDeskripsi,
    audioUrl,
    setAudioUrl,
    audioTitle,
    setAudioTitle,
    audioDuration,
    setAudioDuration,
    isPrivate,
    setIsPrivate,
    courseId,
    setCourseId,
    availableCourses,
    soals,
    isPending,
    isEdit,
    formAction,
    deleteAction,
    handleRemoveSoal,
    handleCopiedSoals,
    // Form state for adding/editing soal
    currentPertanyaan,
    setCurrentPertanyaan,
    currentAttachmentUrl,
    setCurrentAttachmentUrl,
    currentAttachmentType,
    setCurrentAttachmentType,
    currentType,
    setCurrentType,
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
    handleFileUpload,
    handleEditSoal,
    handleEditSoalWithValues
  } = useSoalForm()

  return (
    <div className="container max-w-5xl mx-auto p-4 md:p-6 min-h-[calc(100vh-4rem)]">
      <Card className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center">
            <h1 className="text-xl md:text-2xl font-bold text-primary">
              {isEdit ? "Edit Koleksi Soal" : "Tambah Koleksi Soal"}
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
            <div>
              <label 
                htmlFor="nama" 
                className="flex items-center gap-2 text-sm font-medium text-foreground mb-1"
              >
                <Book className="w-4 h-4" />
                Nama Koleksi
              </label>
              <Input
                type="text"
                id="nama"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Contoh: Kosakata Bab 1"
                required
              />
            </div>

            <div>
              <label 
                htmlFor="deskripsi" 
                className="flex items-center gap-2 text-sm font-medium text-foreground mb-1"
              >
                <FileText className="w-4 h-4" />
                Deskripsi (Opsional)
              </label>
              <Textarea
                id="deskripsi"
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                placeholder="Deskripsi singkat tentang koleksi soal ini"
                rows={3}
              />
            </div>

            <div>
              <label
                htmlFor="audioUrl"
                className="flex items-center gap-2 text-sm font-medium text-foreground mb-1"
              >
                <Volume2 className="w-4 h-4" />
                Audio untuk Listening (Opsional)
              </label>
              <Input
                type="url"
                id="audioUrl"
                value={audioUrl}
                onChange={(e) => setAudioUrl(e.target.value)}
                placeholder="https://example.com/audio.mp3"
              />
              <p className="text-xs text-muted-foreground mt-1">
                URL audio yang akan diputar untuk soal-soal listening
              </p>
            </div>

            <div>
              <label
                htmlFor="audioTitle"
                className="flex items-center gap-2 text-sm font-medium text-foreground mb-1"
              >
                <Volume2 className="w-4 h-4" />
                Judul Audio (Opsional)
              </label>
              <Input
                type="text"
                id="audioTitle"
                value={audioTitle}
                onChange={(e) => setAudioTitle(e.target.value)}
                placeholder="Contoh: Dialog percakapan sehari-hari"
              />
            </div>

            <div>
              <label
                htmlFor="audioDuration"
                className="flex items-center gap-2 text-sm font-medium text-foreground mb-1"
              >
                <Volume2 className="w-4 h-4" />
                Durasi Audio (detik, opsional)
              </label>
              <Input
                type="number"
                id="audioDuration"
                value={audioDuration || ''}
                onChange={(e) => setAudioDuration(e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="180"
                min="1"
              />
            </div>

            <div>
              <label
                className="flex items-center gap-2 text-sm font-medium text-foreground mb-1"
              >
                <GraduationCap className="w-4 h-4" />
                Course (Opsional)
              </label>
              <Select value={courseId?.toString() || "none"} onValueChange={(value) => setCourseId(value === "none" ? undefined : parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih course untuk membatasi akses soal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Tanpa Course (Publik)</SelectItem>
                  {availableCourses.map((course) => (
                    <SelectItem key={course.id} value={course.id.toString()}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Jika dipilih, hanya anggota course yang dapat mengakses soal ini
              </p>
            </div>

            <div>
              <label 
                className="flex items-center gap-2 text-sm font-medium text-foreground mb-1"
              >
                <Lock className="w-4 h-4" />
                Status Privasi
              </label>
              <div className="flex items-center gap-2">
                <Switch
                  checked={isPrivate}
                  onCheckedChange={setIsPrivate}
                />
                <span className="text-sm text-muted-foreground">
                  {isPrivate ? "Koleksi Privat" : "Koleksi Publik"}
                </span>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Form untuk menambah soal */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-foreground">
                <ListPlus className="w-5 h-5" />
                Daftar Soal
                <span className="text-sm font-normal text-muted-foreground">
                  ({soals.length} soal)
                </span>
              </h2>
            </div>

            {/* Actions untuk menambah soal */}
            <div className="flex flex-wrap items-center max-w-4xl gap-2">
              <AddSoalDialog
                isEditing={false}
                editingSoalIndex={null}
                currentPertanyaan={currentPertanyaan}
                setCurrentPertanyaan={setCurrentPertanyaan}
                currentAttachmentUrl={currentAttachmentUrl}
                setCurrentAttachmentUrl={setCurrentAttachmentUrl}
                currentAttachmentType={currentAttachmentType}
                setCurrentAttachmentType={setCurrentAttachmentType}
                currentType={currentType}
                setCurrentType={setCurrentType}
                currentDifficulty={currentDifficulty}
                setCurrentDifficulty={setCurrentDifficulty}
                currentExplanation={currentExplanation}
                setCurrentExplanation={setCurrentExplanation}
                currentOpsis={currentOpsis}
                setCurrentOpsis={setCurrentOpsis}
                newOpsiText={newOpsiText}
                setNewOpsiText={setNewOpsiText}
                isUploading={isUploading}
                handleAddOpsi={handleAddOpsi}
                handleRemoveOpsi={handleRemoveOpsi}
                handleToggleCorrect={handleToggleCorrect}
                handleAddSoal={handleAddSoal}
                handleFileUpload={handleFileUpload}
                                handleEditSoal={handleEditSoal}
                               
                                handleEditSoalWithValues={handleEditSoalWithValues}
              />
              {isEdit && (
                <CopySoalDialog 
                  currentCollectionId={parseInt(searchParams.get("id") || "")} 
                  onSuccess={handleCopiedSoals}
                />
              )}
            </div>

            {/* Daftar soal yang sudah ditambahkan */}
            <Card className="border border-border mt-8">
                <ScrollArea className="h-[400px] w-full rounded-md">
                  <div className="p-4 space-y-4">
                  {soals.map((soal, index) => (
                    <div
                      key={index}
                      className="p-4 bg-card border border-border rounded-lg space-y-3 hover:bg-accent/5 transition-colors group"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="secondary"
                              className={`${typeColors[soal.type as keyof typeof typeColors]} transition-colors`}
                            >
                              {typeLabels[soal.type as keyof typeof typeLabels]}
                            </Badge>
                            <Badge
                              variant="secondary"
                              className={`${difficultyColors[soal.difficulty as keyof typeof difficultyColors]} transition-colors`}
                            >
                              {difficultyLabels[soal.difficulty as keyof typeof difficultyLabels]}
                            </Badge>
                            <div className="font-medium flex items-center gap-2">
                              <AddSoalDialog
                                isEditing={true}
                                editingSoalIndex={index}
                                currentPertanyaan={soal.pertanyaan}
                                setCurrentPertanyaan={setCurrentPertanyaan}
                                currentAttachmentUrl={soal.attachmentUrl || ''}
                                setCurrentAttachmentUrl={setCurrentAttachmentUrl}
                                currentAttachmentType={soal.attachmentType}
                                setCurrentAttachmentType={setCurrentAttachmentType}
                                currentType={soal.type}
                                setCurrentType={setCurrentType}
                                currentDifficulty={soal.difficulty}
                                setCurrentDifficulty={setCurrentDifficulty}
                                currentExplanation={soal.explanation || ''}
                                setCurrentExplanation={setCurrentExplanation}
                                currentOpsis={soal.opsis}
                                setCurrentOpsis={setCurrentOpsis}
                                newOpsiText={newOpsiText}
                                setNewOpsiText={setNewOpsiText}
                                isUploading={isUploading}
                                handleAddOpsi={handleAddOpsi}
                                handleRemoveOpsi={handleRemoveOpsi}
                                handleToggleCorrect={handleToggleCorrect}
                                handleAddSoal={handleAddSoal}
                                handleFileUpload={handleFileUpload}
                                handleEditSoal={handleEditSoal}
                                handleEditSoalWithValues={handleEditSoalWithValues}
                              />
                              <span>{soal.pertanyaan}</span>
                            </div>
                          </div>
                          {soal.attachmentUrl && (
                            <div className="mt-3">
                              {soal.attachmentType === "IMAGE" ? (
                                <Image 
                                  src={soal.attachmentUrl} 
                                  alt="Attachment" 
                                  width={200}
                                  height={200}
                                  className="rounded-md object-contain"
                                />
                              ) : (
                                <audio 
                                  src={soal.attachmentUrl} 
                                  controls 
                                  className="w-full max-w-[300px]"
                                />
                              )}
                            </div>
                          )}
                        </div>
                        <Button
                          type="button"
                          onClick={() => handleRemoveSoal(index)}
                          variant="ghost" 
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 h-8 w-8 text-muted-foreground hover:text-destructive transition-opacity"
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Hapus</span>
                        </Button>
                      </div>
                      {soal.explanation && (
                        <p className="text-sm text-muted-foreground italic border-l-2 border-border pl-3 mt-2 flex items-start gap-2">
                          <HelpCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          {soal.explanation}
                        </p>
                      )}
                      <div className="pl-4 border-l-2 border-accent space-y-1.5 mt-3">
                        {soal.opsis.map((opsi, opsiIndex) => (
                          <div 
                            key={opsiIndex}
                            className={`text-sm ${
                              opsi.isCorrect 
                                ? "text-primary font-medium" 
                                : "text-muted-foreground"
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <span className="flex-1">
                                {opsi.opsiText || (opsi.attachmentUrl ? "[Lampiran]" : "[Opsi kosong]")}
                                {opsi.isCorrect && " ✓"}
                              </span>
                            </div>
                            {opsi.attachmentUrl && (
                              <div className="mt-2 ml-4">
                                {opsi.attachmentType === "IMAGE" ? (
                                  <Image 
                                    src={opsi.attachmentUrl} 
                                    alt="Opsi attachment" 
                                    width={120}
                                    height={120}
                                    className="rounded-md object-contain"
                                  />
                                ) : (
                                  <audio 
                                    src={opsi.attachmentUrl} 
                                    controls 
                                    className="w-full max-w-[200px]"
                                  />
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {soals.length === 0 && (
                    <p className="text-center text-sm text-muted-foreground py-8">
                      Belum ada soal yang ditambahkan
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
            
            <Link href="/soal">
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
