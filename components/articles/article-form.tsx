'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { addArticle, updateArticle } from "@/actions/article-actions"
import { useRouter } from 'next/navigation'

interface ArticleFormProps {
  initialData?: {
    id?: number
    title: string
    description: string | null
    jsonDescription: string
    htmlDescription: string
  }
}

export function ArticleForm({ initialData }: ArticleFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    jsonDescription: initialData?.jsonDescription || '',
    htmlDescription: initialData?.htmlDescription || ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (initialData?.id) {
        // Update existing article
        const result = await updateArticle(initialData.id, formData)
        if (result.success) {
          router.push(`/artikel/${result.articleId}`)
        }
      } else {
        // Create new article
        const result = await addArticle(formData)
        if (result.success) {
          router.push(`/artikel/${result.articleId}`)
        }
      }
    } catch (error) {
      console.error('Failed to save article:', error)
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
            placeholder="Optional"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="jsonDescription">Content (JSON)</Label>
          <textarea
            id="jsonDescription"
            value={formData.jsonDescription}
            onChange={(e) => setFormData({ ...formData, jsonDescription: e.target.value })}
            className="w-full p-2 border rounded min-h-[200px]"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="htmlDescription">Content (HTML)</Label>
          <textarea
            id="htmlDescription"
            value={formData.htmlDescription}
            onChange={(e) => setFormData({ ...formData, htmlDescription: e.target.value })}
            className="w-full p-2 border rounded min-h-[200px]"
            required
          />
        </div>

        <Button type="submit" className="w-full">
          {initialData ? 'Update Article' : 'Create Article'}
        </Button>
      </form>
    </Card>
  )
}
