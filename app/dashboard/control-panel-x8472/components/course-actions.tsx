"use client"

import { useState } from "react"
import { Course } from "@/actions/course-actions"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { deleteCourse } from "@/actions/course-actions"
import { toast } from "sonner"

interface CourseActionsProps {
  course: Course
  onDeleted: () => void
}

export function CourseActions({ course, onDeleted }: CourseActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm("Apakah Anda yakin ingin menghapus kursus ini? Semua modul di dalamnya juga akan dihapus.")) {
      return
    }

    setIsDeleting(true)
    try {
      const result = await deleteCourse(course.id)
      if (result.success) {
        toast.success("Kursus berhasil dihapus")
        onDeleted()
      } else {
        toast.error(result.error || "Gagal menghapus kursus")
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat menghapus kursus")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleDelete}
      disabled={isDeleting}
    >
      <Trash2 className="h-4 w-4 text-destructive" />
    </Button>
  )
}
