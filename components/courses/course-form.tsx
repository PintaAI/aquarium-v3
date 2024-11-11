'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { addCourse, updateCourse } from '@/actions/course-actions'
import { useRouter } from 'next/navigation'
import { CourseLevel } from '@prisma/client'

interface CourseFormProps {
  initialData?: {
    id?: number
    title: string
    description: string
    level: CourseLevel
    thumbnail?: string | null
    jsonDescription: string
    htmlDescription: string
  }
}

export function CourseForm({ initialData }: CourseFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    level: initialData?.level || CourseLevel.BEGINNER,
    thumbnail: initialData?.thumbnail || '',
    jsonDescription: initialData?.jsonDescription || '',
    htmlDescription: initialData?.htmlDescription || ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (initialData?.id) {
        // Update existing course
        const result = await updateCourse(initialData.id, formData)
        if (result.success) {
          router.push(`/courses/${result.courseId}`)
        }
      } else {
        // Create new course
        const result = await addCourse(formData)
        if (result.success) {
          router.push(`/courses/${result.courseId}`)
        }
      }
    } catch (error) {
      console.error('Failed to save course:', error)
    }
  }

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="level">Level</Label>
          <Select
            value={formData.level}
            onValueChange={(value: CourseLevel) => setFormData({ ...formData, level: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={CourseLevel.BEGINNER}>Beginner</SelectItem>
              <SelectItem value={CourseLevel.INTERMEDIATE}>Intermediate</SelectItem>
              <SelectItem value={CourseLevel.ADVANCED}>Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="thumbnail">Thumbnail URL</Label>
          <Input
            id="thumbnail"
            value={formData.thumbnail || ''}
            onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
            placeholder="Optional"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="jsonDescription">JSON Description</Label>
          <textarea
            id="jsonDescription"
            value={formData.jsonDescription}
            onChange={(e) => setFormData({ ...formData, jsonDescription: e.target.value })}
            className="w-full p-2 border rounded min-h-[100px]"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="htmlDescription">HTML Description</Label>
          <textarea
            id="htmlDescription"
            value={formData.htmlDescription}
            onChange={(e) => setFormData({ ...formData, htmlDescription: e.target.value })}
            className="w-full p-2 border rounded min-h-[100px]"
            required
          />
        </div>

        <Button type="submit" className="w-full">
          {initialData ? 'Update Course' : 'Create Course'}
        </Button>
      </form>
    </Card>
  )
}
