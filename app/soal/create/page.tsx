"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { Book, FileText, ListPlus, Trash2, X, GraduationCap, Volume2, Upload, ChevronRight, ChevronLeft, Eye, EyeOff, GripVertical} from "lucide-react"
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
import { UploadProgress } from "@/components/ui/upload-progress"
import { AddSoalDialog } from "./components/add-soal-dialog"
import { useSoalForm } from "./hooks/use-soal-form"
import { DragDropContext, Droppable, Draggable, DroppableProvided, DraggableProvided, DraggableStateSnapshot } from "@hello-pangea/dnd"

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


export default function CreateSoalPage() {
  const searchParams = useSearchParams()
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set())

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedQuestions)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedQuestions(newExpanded)
  }

  const isExpanded = (index: number) => expandedQuestions.has(index)
  const {
    nama,
    setNama,
    deskripsi,
    setDeskripsi,
    audioUrl,
    setAudioUrl,
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
    isUploadingAudio,
    uploadProgress,
    handleAddOpsi,
    handleRemoveOpsi,
    handleToggleCorrect,
    handleAddSoal,
    handleFileUpload,
    handleAudioFileUpload,
    handleEditSoal,
    handleEditSoalWithValues,
    handleDragEnd
  } = useSoalForm()

  return (
    <div className="container max-w-[1700px] mx-auto p-4 md:p-6 min-h-[calc(100vh-4rem)]">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column - Form */}
        <div className="lg:w-1/2">
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

            {/* Audio, Course and Privacy Settings Row */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Audio Upload */}
                <div>
                  <label
                    className="flex items-center gap-2 text-sm font-medium text-foreground mb-1"
                  >
                    <Volume2 className="w-4 h-4" />
                    Audio Listening
                  </label>
                  <div className="space-y-2">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isUploadingAudio}
                      onClick={() => {
                        const input = document.createElement('input')
                        input.type = 'file'
                        input.accept = 'audio/*'
                        input.onchange = async (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0]
                          if (file) {
                            await handleAudioFileUpload(file)
                          }
                        }
                        input.click()
                      }}
                      className="w-full h-10"
                    >
                      {isUploadingAudio ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
                          {uploadProgress > 0 ? `${uploadProgress}%` : 'Upload...'}
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Upload className="w-4 h-4" />
                          {audioUrl ? 'Ganti' : 'Upload'}
                        </span>
                      )}
                    </Button>
                    
                    {/* Upload Progress Indicator */}
                    <UploadProgress
                      progress={uploadProgress}
                      isUploading={isUploadingAudio}
                      fileName={isUploadingAudio ? "Audio File" : undefined}
                    />
                    
                    <p className="text-xs text-muted-foreground">
                      Upload file audio (opsional) - Support file besar (40MB+)
                    </p>
                  </div>
                </div>

                {/* Course Selection */}
                <div>
                  <label
                    className="flex items-center gap-2 text-sm font-medium text-foreground mb-1"
                  >
                    <GraduationCap className="w-4 h-4" />
                    Course
                  </label>
                  <Select value={courseId?.toString() || "none"} onValueChange={(value) => setCourseId(value === "none" ? undefined : parseInt(value))}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Pilih course" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Tanpa Course</SelectItem>
                      {availableCourses.map((course) => (
                        <SelectItem key={course.id} value={course.id.toString()}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Batasi akses (opsional)
                  </p>
                </div>

                {/* Publication Status */}
                <div>
                  <label
                    className="flex items-center gap-2 text-sm font-medium text-foreground mb-1"
                  >
                    {isPrivate ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    Status Publikasi
                  </label>
                  <div className="flex items-center gap-2 h-10">
                    <Switch
                      checked={!isPrivate}
                      onCheckedChange={(checked) => setIsPrivate(!checked)}
                    />
                    <span className="text-sm font-medium">
                      {isPrivate ? "Draft" : "Publish"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isPrivate
                      ? "Hanya Anda yang dapat melihat"
                      : courseId
                        ? "Anggota course dapat mengakses"
                        : "Semua pengguna dapat mengakses"
                    }
                  </p>
                </div>
              </div>

              {/* Audio Preview - Full Width */}
              {audioUrl && (
                <div className="p-3 bg-muted/50 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <audio
                      src={audioUrl}
                      controls
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setAudioUrl('')}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
              </div>

              <Separator className="my-6" />

              {/* Actions untuk menambah soal */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold flex items-center gap-2 text-foreground">
                    <ListPlus className="w-5 h-5" />
                    Tambah Soal
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-2">
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

        {/* Right Column - Question List */}
        <div className="lg:w-1/2">
          <Card className="p-4 md:p-6">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-foreground">
                <ListPlus className="w-5 h-5" />
                Daftar Soal
                <span className="text-sm font-normal text-muted-foreground">
                  ({soals.length} soal)
                </span>
              </h2>
            </div>

            <ScrollArea className="h-[calc(100vh-12rem)] w-full rounded-md">
              {soals.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">Belum ada soal yang ditambahkan</p>
                </div>
              ) : (
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="soals">
                    {(provided: DroppableProvided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-3"
                      >
                        {soals.map((soal, index) => (
                          <Draggable
                            key={`soal-${index}`}
                            draggableId={`soal-${index}`}
                            index={index}
                          >
                            {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`bg-card border border-border shadow-lg rounded-lg hover:bg-accent/5 transition-colors group ${
                                  snapshot.isDragging ? 'shadow-xl rotate-2 bg-accent/10' : ''
                                }`}
                              >
                                {/* Header Section - Always Visible */}
                                <div className="p-3 flex items-center gap-3">
                                  {/* Drag Handle */}
                                  <div 
                                    {...provided.dragHandleProps}
                                    className="flex-shrink-0 cursor-grab active:cursor-grabbing"
                                  >
                                    <div className="relative">
                                      <div className="flex items-center justify-center w-8 h-8 bg-primary/10 text-primary rounded-lg font-medium text-sm group-hover:opacity-0 transition-opacity">
                                        {index + 1}
                                      </div>
                                      {/* Drag indicator */}
                                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                                      </div>
                                    </div>
                                  </div>

                                  {/* Question Content */}
                                  <div className="flex-1 min-w-0">
                                    {/* Badges */}
                                    <div className="flex items-center gap-2 mb-1">
                                      <Badge
                                        variant="secondary"
                                        className={`${typeColors[soal.type as keyof typeof typeColors]} text-xs`}
                                      >
                                        {soal.type === 'LISTENING' ? '듣기' : '읽기'}
                                      </Badge>
                                      <Badge
                                        variant="secondary"
                                        className={`${difficultyColors[soal.difficulty as keyof typeof difficultyColors]} text-xs`}
                                      >
                                        {difficultyLabels[soal.difficulty as keyof typeof difficultyLabels]}
                                      </Badge>
                                    </div>
                                    
                                    {/* Question text */}
                                    <div className="font-medium text-sm mb-1">
                                      {soal.pertanyaan.length > 60 ? `${soal.pertanyaan.substring(0, 60)}...` : soal.pertanyaan}
                                    </div>
                                    
                                    {/* Stats */}
                                    <div className="text-xs text-muted-foreground">
                                      {soal.opsis.length} opsi • {soal.opsis.filter(o => o.isCorrect).length} benar
                                      {soal.attachmentUrl && " • Lampiran"}
                                      {soal.explanation && " • Penjelasan"}
                                    </div>
                                  </div>

                                  {/* Action Buttons */}
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => toggleExpanded(index)}
                                      className="h-7 w-7 p-0"
                                    >
                                      {isExpanded(index) ? (
                                        <ChevronLeft className="h-3 w-3" />
                                      ) : (
                                        <ChevronRight className="h-3 w-3" />
                                      )}
                                    </Button>
                                    
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
                                    
                                    <Button
                                      type="button"
                                      onClick={() => handleRemoveSoal(index)}
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>

                                {/* Expanded Content */}
                                {isExpanded(index) && (
                                  <div className="border-t border-border bg-muted/30 p-3 space-y-3">
                                    {/* Full Question Text */}
                                    <div>
                                      <h4 className="font-medium text-sm text-muted-foreground mb-1">Pertanyaan:</h4>
                                      <p className="text-sm">{soal.pertanyaan}</p>
                                    </div>

                                    {/* Attachment */}
                                    {soal.attachmentUrl && (
                                      <div>
                                        <h4 className="font-medium text-sm text-muted-foreground mb-1">Lampiran:</h4>
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

                                    {/* Options */}
                                    <div>
                                      <h4 className="font-medium text-sm text-muted-foreground mb-2">Opsi:</h4>
                                      <div className="space-y-1">
                                        {soal.opsis.map((opsi, opsiIndex) => (
                                          <div
                                            key={opsiIndex}
                                            className={`text-sm p-2 rounded ${
                                              opsi.isCorrect
                                                ? "bg-green-50 text-green-800 border border-green-200"
                                                : "bg-background"
                                            }`}
                                          >
                                            <span className="font-medium">{String.fromCharCode(65 + opsiIndex)}.</span> {opsi.opsiText || "[Lampiran]"}
                                            {opsi.isCorrect && " ✓"}
                                          </div>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Explanation */}
                                    {soal.explanation && (
                                      <div>
                                        <h4 className="font-medium text-sm text-muted-foreground mb-1">Penjelasan:</h4>
                                        <p className="text-sm text-muted-foreground italic">{soal.explanation}</p>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              )}
            </ScrollArea>
          </Card>
        </div>
      </div>
    </div>
  )
}
