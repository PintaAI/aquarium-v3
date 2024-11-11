'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { createModule, updateModule } from '@/actions/module-actions'
import { useRouter } from 'next/navigation'

interface ModuleFormProps {
  courseId: number;
  initialData?: {
    id?: number;
    title: string;
    description: string;
    jsonDescription: string;
    htmlDescription: string;
    order: number;
  }
}

export function ModuleForm({ courseId, initialData }: ModuleFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    jsonDescription: initialData?.jsonDescription || '',
    htmlDescription: initialData?.htmlDescription || '',
    order: initialData?.order || 0,
    courseId: courseId
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (initialData?.id) {
        // Update existing module
        const result = await updateModule(initialData.id, formData)
        if (result.success) {
          router.push(`/courses/${courseId}/modules/${result.moduleId}`)
        }
      } else {
        // Create new module
        const result = await createModule(formData)
        if (result.success) {
          router.push(`/courses/${courseId}/modules/${result.moduleId}`)
        }
      }
    } catch (error) {
      console.error('Failed to save module:', error)
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
          <Label htmlFor="order">Order</Label>
          <Input
            id="order"
            type="number"
            value={formData.order}
            onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
            required
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
          {initialData ? 'Update Module' : 'Create Module'}
        </Button>
      </form>
    </Card>
  )
}
