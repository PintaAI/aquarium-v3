'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { BookOpen, ListOrdered, Clock } from "lucide-react"
import { JSONContent } from 'novel'

import Editor, { defaultEditorContent } from '../editor/editor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { createModule, updateModule } from '@/app/actions/module-actions'

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

interface ModuleData {
  title: string;
  description: string;
  jsonDescription: string;
  htmlDescription: string;
  order: number;
  courseId: number;
}

export function ModuleForm({ courseId, initialData }: ModuleFormProps) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [order, setOrder] = useState(initialData?.order || 0)
  const [jsonDescription, setJsonDescription] = useState<JSONContent>(
    initialData?.jsonDescription ? JSON.parse(initialData.jsonDescription) : defaultEditorContent
  )
  const [htmlDescription, setHtmlDescription] = useState(initialData?.htmlDescription || '')
  const [pending, setPending] = useState(false)
  const router = useRouter()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    
    if (!title || !description || !jsonDescription || !htmlDescription) {
      toast.error('Please fill in all required fields')
      return
    }

    setPending(true)

    try {
      const moduleData: ModuleData = {
        title,
        description,
        jsonDescription: JSON.stringify(jsonDescription),
        htmlDescription,
        order,
        courseId
      }

      let result
      if (initialData?.id) {
        result = await updateModule(initialData.id, moduleData)
      } else {
        result = await createModule(moduleData)
      }

      if (!result.success) {
        throw new Error(result.error || 'Failed to save module')
      }

      toast.success(initialData ? 'Module updated successfully' : 'Module created successfully')
      router.push(`/courses/${courseId}/modules/${result.moduleId}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save module')
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
              placeholder='Write module title here...'
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
              required
            />
            
            <div className="flex flex-col md:flex-row justify-between text-sm text-muted-foreground gap-4 md:gap-0">
              <div className="flex items-center">
                <BookOpen className="mr-2" size={16} />
                <span>Author</span>
              </div>
              <div className="flex items-center">
                <ListOrdered className="mr-2" size={16} />
                <Input
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(parseInt(e.target.value))}
                  className="w-20 h-8 text-center"
                  min={0}
                  required
                />
              </div>
              <div className="flex items-center">
                <Clock className="mr-2" size={16} />
                <span>Draft</span>
              </div>
            </div>

            <Button type="submit" disabled={pending} className="w-full">
              {pending ? 'Saving...' : initialData ? 'Update Module' : 'Create Module'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl md:text-2xl font-bold">Module Content</h2>
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
