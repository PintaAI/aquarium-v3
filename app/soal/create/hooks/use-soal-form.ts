"use client"

import { useState, useTransition, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Difficulty } from "@prisma/client"
import { createKoleksiSoal, getKoleksiSoal, updateKoleksiSoal, deleteKoleksiSoal } from "@/app/actions/soal-actions"
import { getCourses } from "@/app/actions/course-actions"
import { uploadImage } from "@/app/actions/upload-image"
import { uploadAudio } from "@/app/actions/upload-audio"

interface Opsi {
  opsiText: string
  attachmentUrl?: string
  attachmentType?: "IMAGE" | "AUDIO"
  isCorrect: boolean
}

interface Soal {
  pertanyaan: string
  attachmentUrl?: string
  attachmentType?: "IMAGE" | "AUDIO"
  difficulty?: Difficulty
  explanation?: string
  opsis: Opsi[]
}

export const useSoalForm = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  
  const koleksiId = searchParams.get("id")
  const isEdit = Boolean(koleksiId)

  // Form states
  const [nama, setNama] = useState("")
  const [deskripsi, setDeskripsi] = useState("")
  const [isPrivate, setIsPrivate] = useState(false)
  const [courseId, setCourseId] = useState<number | undefined>(undefined)
  const [availableCourses, setAvailableCourses] = useState<any[]>([])
  const [soals, setSoals] = useState<Soal[]>([])
  
  // Current soal being edited
  const [currentPertanyaan, setCurrentPertanyaan] = useState("")
  const [currentAttachmentUrl, setCurrentAttachmentUrl] = useState("")
  const [currentAttachmentType, setCurrentAttachmentType] = useState<"IMAGE" | "AUDIO">()
  const [currentDifficulty, setCurrentDifficulty] = useState<Difficulty>()
  const [currentExplanation, setCurrentExplanation] = useState("")
  const [currentOpsis, setCurrentOpsis] = useState<Opsi[]>([])
  const [newOpsiText, setNewOpsiText] = useState("")
  const [isUploading, setIsUploading] = useState(false)

  // Load available courses
  useEffect(() => {
    const loadCourses = async () => {
      try {
        const courses = await getCourses()
        console.log("Loaded courses:", courses) // Debug log
        setAvailableCourses(courses)
      } catch (error) {
        console.error("Failed to load courses:", error)
      }
    }
    loadCourses()
  }, [])

  // Load existing data if editing
  useEffect(() => {
    if (isEdit && koleksiId) {
      const loadKoleksi = async () => {
        const result = await getKoleksiSoal(parseInt(koleksiId))
        if (result.success && result.data) {
          setNama(result.data.nama)
          setDeskripsi(result.data.deskripsi ?? "")
          setIsPrivate(result.data.isPrivate)
          setCourseId(result.data.courseId ?? undefined)
          setSoals(result.data.soals.map(soal => ({
            pertanyaan: soal.pertanyaan,
            attachmentUrl: soal.attachmentUrl ?? undefined,
            attachmentType: soal.attachmentType as "IMAGE" | "AUDIO" | undefined,
            difficulty: soal.difficulty ?? undefined,
            explanation: soal.explanation ?? undefined,
            opsis: soal.opsis.map(opsi => ({
              opsiText: opsi.opsiText,
              attachmentUrl: opsi.attachmentUrl ?? undefined,
              attachmentType: opsi.attachmentType as "IMAGE" | "AUDIO" | undefined,
              isCorrect: opsi.isCorrect
            }))
          })))
        }
      }
      loadKoleksi()
    }
  }, [koleksiId, isEdit])

  // Handle file upload
  const handleFileUpload = async (file: File): Promise<string> => {
    if (!file) return ''

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      
      const url = currentAttachmentType === "AUDIO" 
        ? await uploadAudio(formData)
        : await uploadImage(formData)
        
      setCurrentAttachmentUrl(url)
      toast.success("File berhasil diunggah")
      return url
    } catch (error) {
      toast.error("Gagal mengunggah file")
      console.error(error)
      return ''
    } finally {
      setIsUploading(false)
    }
  }

  // Add opsi handler
  const handleAddOpsi = () => {
    // Allow empty text for attachment-only opsi
    setCurrentOpsis([...currentOpsis, { opsiText: newOpsiText || "", isCorrect: false }])
    setNewOpsiText("")
  }

  // Remove opsi handler
  const handleRemoveOpsi = (index: number) => {
    setCurrentOpsis(currentOpsis.filter((_, i) => i !== index))
  }

  // Toggle correct opsi
  const handleToggleCorrect = (index: number) => {
    setCurrentOpsis(currentOpsis.map((opsi, i) => ({
      ...opsi,
      isCorrect: i === index
    })))
  }

  // Add or edit soal handler
  const handleAddSoal = (editIndex?: number) => {
    if (!currentPertanyaan || currentOpsis.length === 0 || !currentDifficulty) {
      toast.error("Pertanyaan, tingkat kesulitan, dan minimal satu opsi harus diisi")
      return
    }

    if (!currentOpsis.some(opsi => opsi.isCorrect)) {
      toast.error("Pilih minimal satu jawaban yang benar")
      return
    }

    const newSoal: Soal = {
      pertanyaan: currentPertanyaan,
      attachmentUrl: currentAttachmentUrl || undefined,
      attachmentType: currentAttachmentType || undefined,
      difficulty: currentDifficulty,
      explanation: currentExplanation || undefined,
      opsis: currentOpsis
    }

    if (typeof editIndex === 'number') {
      // Edit existing soal
      setSoals(soals.map((soal, index) => 
        index === editIndex ? newSoal : soal
      ))
    } else {
      // Add new soal
      setSoals([...soals, newSoal])
    }
    
    // Reset current soal form
    setCurrentPertanyaan("")
    setCurrentAttachmentUrl("")
    setCurrentAttachmentType(undefined)
    setCurrentDifficulty(undefined)
    setCurrentExplanation("")
    setCurrentOpsis([])
  }

  // Remove soal handler
  const handleRemoveSoal = (index: number) => {
    setSoals(soals.filter((_, i) => i !== index))
  }

  // Form submission handler
  const formAction = async (e: React.FormEvent) => {
    e.preventDefault()
    if (soals.length === 0) {
      toast.error("Tambahkan minimal satu soal")
      return
    }

    startTransition(async () => {
      try {
        if (isEdit && koleksiId) {
          const result = await updateKoleksiSoal(parseInt(koleksiId), nama, deskripsi, soals, isPrivate, courseId)
          if (result.success) {
            toast.success("Koleksi soal berhasil diperbarui")
            router.push("/soal")
            router.refresh()
          } else {
            toast.error(result.error || "Terjadi kesalahan")
          }
        } else {
          const result = await createKoleksiSoal(nama, deskripsi, soals, isPrivate, courseId)
          if (result.success) {
            toast.success("Koleksi soal berhasil ditambahkan")
            router.push("/soal")
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
    if (!koleksiId) return

    startTransition(async () => {
      try {
        const result = await deleteKoleksiSoal(parseInt(koleksiId))
        if (result.success) {
          toast.success("Koleksi soal berhasil dihapus")
          router.push("/soal")
          router.refresh()
        } else {
          toast.error(result.error || "Terjadi kesalahan")
        }
      } catch {
        toast.error("Terjadi kesalahan")
      }
    })
  }

  // Handle copied soals
  const handleCopiedSoals = () => {
    // Reload the collection data to get the updated soals
    if (isEdit && koleksiId) {
      const loadKoleksi = async () => {
        const result = await getKoleksiSoal(parseInt(koleksiId))
        if (result.success && result.data) {
          setSoals(result.data.soals.map(soal => ({
            pertanyaan: soal.pertanyaan,
            attachmentUrl: soal.attachmentUrl ?? undefined,
            attachmentType: soal.attachmentType as "IMAGE" | "AUDIO" | undefined,
            difficulty: soal.difficulty ?? undefined,
            explanation: soal.explanation ?? undefined,
            opsis: soal.opsis.map(opsi => ({
              opsiText: opsi.opsiText,
              attachmentUrl: opsi.attachmentUrl ?? undefined,
              attachmentType: opsi.attachmentType as "IMAGE" | "AUDIO" | undefined,
              isCorrect: opsi.isCorrect
            }))
          })))
        }
      }
      loadKoleksi()
    }
  }

  // Edit soal handler
  const handleEditSoal = (index: number) => {
    if (!currentPertanyaan || currentOpsis.length === 0 || !currentDifficulty) {
      toast.error("Pertanyaan, tingkat kesulitan, dan minimal satu opsi harus diisi")
      return
    }

    if (!currentOpsis.some(opsi => opsi.isCorrect)) {
      toast.error("Pilih minimal satu jawaban yang benar")
      return
    }

    handleAddSoal(index)
  }

  // Edit soal handler with direct values
  const handleEditSoalWithValues = (
    index: number,
    pertanyaan: string,
    attachmentUrl: string,
    attachmentType: "IMAGE" | "AUDIO" | undefined,
    difficulty: Difficulty | undefined,
    explanation: string,
    opsis: Opsi[]
  ) => {
    if (!pertanyaan || opsis.length === 0 || !difficulty) {
      toast.error("Pertanyaan, tingkat kesulitan, dan minimal satu opsi harus diisi")
      return
    }

    if (!opsis.some(opsi => opsi.isCorrect)) {
      toast.error("Pilih minimal satu jawaban yang benar")
      return
    }

    const newSoal: Soal = {
      pertanyaan,
      attachmentUrl: attachmentUrl || undefined,
      attachmentType,
      difficulty,
      explanation: explanation || undefined,
      opsis
    }

    setSoals(soals.map((soal, i) => 
      i === index ? newSoal : soal
    ))
    
    // Update current state to match the edited soal
    setCurrentPertanyaan(pertanyaan)
    setCurrentAttachmentUrl(attachmentUrl)
    setCurrentAttachmentType(attachmentType)
    setCurrentDifficulty(difficulty)
    setCurrentExplanation(explanation)
    setCurrentOpsis(opsis)
  }

  return {
    nama,
    setNama,
    deskripsi,
    setDeskripsi,
    isPrivate,
    setIsPrivate,
    courseId,
    setCourseId,
    availableCourses,
    soals,
    handleCopiedSoals,
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
    isPending,
    isUploading,
    isEdit,
    formAction,
    deleteAction,
    handleAddOpsi,
    handleRemoveOpsi,
    handleToggleCorrect,
    handleAddSoal,
    handleRemoveSoal,
    handleFileUpload,
    handleEditSoal,
    handleEditSoalWithValues
  }
}
