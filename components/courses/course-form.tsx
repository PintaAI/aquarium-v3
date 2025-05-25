'use client'

import { useState, useRef } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { User, BarChart, Clock, Upload } from "lucide-react"
import { CourseLevel } from '@prisma/client'
import { JSONContent } from 'novel'

import Editor, { defaultEditorContent } from '../editor/editor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { addCourse, updateCourse } from '@/app/actions/course-actions'
import { uploadImage } from '@/app/actions/upload-image'


interface CourseFormProps {
  initialData?: {
    id?: number;
    title: string;
    description: string;
    level: CourseLevel;
    thumbnail: string | null;
    jsonDescription: string;
    htmlDescription: string;
  }
}

interface CourseData {
  title: string;
  description: string;
  level: CourseLevel;
  jsonDescription: string;
  htmlDescription: string;
  thumbnail: string | null;
  isCompleted: boolean;
  isLocked: boolean;
}

export function CourseForm({ initialData }: CourseFormProps) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [level, setLevel] = useState<CourseLevel>(initialData?.level || CourseLevel.BEGINNER)
  const [jsonDescription, setJsonDescription] = useState<JSONContent>(
    initialData?.jsonDescription ? JSON.parse(initialData.jsonDescription) : defaultEditorContent
  )
  const [htmlDescription, setHtmlDescription] = useState(initialData?.htmlDescription || '')
  const [thumbnail, setThumbnail] = useState<string | null>(initialData?.thumbnail || null)
  const [pending, setPending] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  async function handleThumbnailUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      const imageUrl = await uploadImage(formData)
      setThumbnail(imageUrl)
      toast.success('Thumbnail uploaded successfully')
    } catch (error) {
      toast.error('Failed to upload thumbnail')
      console.error('Error uploading thumbnail:', error)
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    
    if (!title || !description || !level || !jsonDescription || !htmlDescription) {
      toast.error('Please fill in all required fields')
      return
    }

    setPending(true)

    try {
      const courseData: CourseData = {
        title,
        description,
        level,
        jsonDescription: JSON.stringify(jsonDescription),
        htmlDescription,
        thumbnail,
        isCompleted: false,
        isLocked: false,
      }

      let result
      if (initialData?.id) {
        result = await updateCourse(initialData.id, courseData)
      } else {
        result = await addCourse(courseData)
      }

      if (!result.success) {
        throw new Error(result.error || 'Failed to save course')
      }

      toast.success(initialData ? 'Course updated successfully' : 'Course created successfully')
      router.push(`/courses/${result.courseId}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save course')
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
              required
            />
            
            <div className="flex flex-col md:flex-row justify-between text-sm text-muted-foreground gap-4 md:gap-0">
              <div className="flex items-center">
                <User className="mr-2" size={16} />
                <span>Author</span>
              </div>
              <div className="flex items-center">
                <BarChart className="mr-2" size={16} />
                <Select value={level} onValueChange={(value: CourseLevel) => setLevel(value)}>
                  <SelectTrigger className="w-full md:w-[140px] border-none">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={CourseLevel.BEGINNER}>Beginner</SelectItem>
                    <SelectItem value={CourseLevel.INTERMEDIATE}>Intermediate</SelectItem>
                    <SelectItem value={CourseLevel.ADVANCED}>Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center">
                <Clock className="mr-2" size={16} />
                <span>0 modules</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
              >
                <Upload className="mr-2" size={16} />
                Upload Thumbnail
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleThumbnailUpload}
                accept="image/*"
                className="hidden"
              />
              {thumbnail && (
                <div className="relative w-20 h-20">
                  <Image
                    src={thumbnail}
                    alt="Course thumbnail"
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
              )}
            </div>

            <Button type="submit" disabled={pending} className="w-full">
              {pending ? 'Saving...' : initialData ? 'Update Course' : 'Create Course'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl md:text-2xl font-bold">Detailed Description</h2>
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
