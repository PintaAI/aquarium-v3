"use client"

import { useState } from "react"
import { Course } from "@prisma/client"
import { createRoom } from "@/actions/room-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { UseCurrentUser as useCurrentUser } from "@/hooks/use-current-user"

interface CreateRoomFormProps {
  courses: Course[]
}

export const CreateRoomForm = ({ courses }: CreateRoomFormProps) => {
  const router = useRouter()
  const user = useCurrentUser()
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    courseId: ""
  })

  if (user?.role !== "GURU") {
    return null
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsLoading(true)
      const room = await createRoom({
        name: formData.name,
        description: formData.description,
        courseId: parseInt(formData.courseId)
      })
      router.push(`/room/${room.id}`)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Video Room</CardTitle>
        <CardDescription>Create a new video room for your course</CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="course">Course</Label>
            <Select
              value={formData.courseId}
              onValueChange={(value) => setFormData(prev => ({ ...prev, courseId: value }))}
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
            <Label htmlFor="name">Room Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter room name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter room description (optional)"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Room"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
