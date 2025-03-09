"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PlusIcon } from "lucide-react"
import { createLiveSession } from "@/app/actions/live-session-actions"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface Course {
  id: number
  title: string
}

interface CreateLiveSessionFormProps {
  courses: Course[]
}

export function CreateLiveSessionForm({ courses }: CreateLiveSessionFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<string>("")
  const router = useRouter()

  const now = new Date()
  const currentDate = now.toISOString().split('T')[0]
  const currentTime = now.toTimeString().slice(0, 5)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const scheduledStartDate = formData.get("scheduledStartDate") as string
    const scheduledStartTime = formData.get("scheduledStartTime") as string

    try {
      await createLiveSession(parseInt(selectedCourse), {
        name,
        description,
        scheduledStart: new Date(`${scheduledStartDate}T${scheduledStartTime}`),
      })
      toast.success("Live session created successfully")
      setIsOpen(false)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create live session")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon className="h-4 w-4 mr-2" />
          New Session
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a Live Session</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="course" className="text-sm font-medium">
              Course
            </label>
            <Select
              value={selectedCourse}
              onValueChange={setSelectedCourse}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id.toString()}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Session Name
            </label>
            <Input
              id="name"
              name="name"
              placeholder="Enter session name"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="description"
              name="description"
              placeholder="Enter session description"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="scheduledStartDate" className="text-sm font-medium">
                Date
              </label>
              <Input
                id="scheduledStartDate"
                name="scheduledStartDate"
                type="date"
                required
                defaultValue={currentDate}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="scheduledStartTime" className="text-sm font-medium">
                Time
              </label>
              <Input
                id="scheduledStartTime"
                name="scheduledStartTime"
                type="time"
                required
                defaultValue={currentTime}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading || !selectedCourse}>
              {isLoading ? "Creating..." : "Create Session"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
