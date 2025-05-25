'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Pencil, Clock } from "lucide-react"
import { JSONContent } from 'novel'
import Editor, { defaultEditorContent } from '../editor/editor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { addArticle, updateArticle } from '@/app/actions/article-actions'

interface ArticleFormProps {
  initialData?: {
    id?: number;
    title: string;
    description: string | null;
    jsonDescription: string;
    htmlDescription: string;
  }
}

interface ArticleData {
  title: string;
  description: string;
  jsonDescription: string;
  htmlDescription: string;
}

export function ArticleForm({ initialData }: ArticleFormProps) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [jsonDescription, setJsonDescription] = useState<JSONContent>(
    initialData?.jsonDescription ? JSON.parse(initialData.jsonDescription) : defaultEditorContent
  )
  const [htmlDescription, setHtmlDescription] = useState(initialData?.htmlDescription || '')
  const [pending, setPending] = useState(false)
  const router = useRouter()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    
    if (!title || !jsonDescription || !htmlDescription) {
      toast.error('Please fill in all required fields')
      return
    }

    setPending(true)

    try {
      const articleData: ArticleData = {
        title,
        description,
        jsonDescription: JSON.stringify(jsonDescription),
        htmlDescription,
      }

      let result
      if (initialData?.id) {
        result = await updateArticle(initialData.id, articleData)
      } else {
        result = await addArticle(articleData)
      }

      if (!result.success) {
        throw new Error(result.error || 'Failed to save article')
      }

      toast.success(initialData ? 'Article updated successfully' : 'Article created successfully')
      router.push(`/artikel/${result.articleId}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save article')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className='max-w-4xl mx-auto space-y-6'>
      <Card className="border-none shadow-md">
        <CardContent className='p-4 md:p-6'>
          <form onSubmit={handleSubmit} className='flex flex-col gap-4 md:gap-6'>
            <Input
              type='text'
              placeholder='Write title here...'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-2xl md:text-3xl font-bold border-none p-0"
              required
            />
            
            <Textarea
              placeholder='Add a brief description here...'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-base md:text-lg text-muted-foreground border-none resize-none min-h-[100px]"
            />
            
            <div className="flex flex-col md:flex-row justify-between text-sm text-muted-foreground gap-4 md:gap-0">
              <div className="flex items-center">
                <Pencil className="mr-2" size={16} />
                <span>Author</span>
              </div>
              <div className="flex items-center">
                <Clock className="mr-2" size={16} />
                <span>Draft</span>
              </div>
            </div>

            <Button type="submit" disabled={pending} className="w-full">
              {pending ? 'Saving...' : initialData ? 'Update Article' : 'Create Article'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl md:text-2xl font-bold">Content</h2>
        <Editor
          initialValue={jsonDescription}
          onChange={(content) => {
            setJsonDescription(content.json)
            setHtmlDescription(content.html)
          }}
        />
      </div>
    </div>
  )
}
