'use client'

import { useState, useRef } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { User, BarChart, Clock, Upload, Calendar, Timer, Lock, Unlock } from "lucide-react"
import { CourseLevel, CourseType } from '@prisma/client'
import { JSONContent } from 'novel'

import Editor, { defaultEditorContent } from '../editor/editor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent } from '@/components/ui/card'
import { addCourse, updateCourse } from '@/app/actions/course-actions'
import { uploadImage } from '@/app/actions/upload-image'


interface CourseFormProps {
  initialData?: {
    id?: number;
    title: string;
    description: string;
    level: CourseLevel;
    type: CourseType;
    eventStartDate: Date | null;
    eventEndDate: Date | null;
    thumbnail: string | null;
    jsonDescription: string;
    htmlDescription: string;
  isLocked: boolean;
  price?: number | null;
  paidCourseMessage?: string | null;
  }
}

interface CourseData {
  title: string;
  description: string;
  level: CourseLevel;
  type: CourseType;
  eventStartDate: Date | null;
  eventEndDate: Date | null;
  jsonDescription: string;
  htmlDescription: string;
  thumbnail: string | null;
  isCompleted: boolean;
  isLocked: boolean;
  price?: number | null;
  paidCourseMessage?: string | null;
}

export function CourseForm({ initialData }: CourseFormProps) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [level, setLevel] = useState<CourseLevel>(initialData?.level || CourseLevel.BEGINNER)
  const [type, setType] = useState<CourseType>(initialData?.type || CourseType.NORMAL)
  const [eventStartDate, setEventStartDate] = useState<string>(
    initialData?.eventStartDate ? new Date(initialData.eventStartDate).toISOString().slice(0, 10) : ''
  )
  const [eventEndDate, setEventEndDate] = useState<string>(
    initialData?.eventEndDate ? new Date(initialData.eventEndDate).toISOString().slice(0, 10) : ''
  )
  const [jsonDescription, setJsonDescription] = useState<JSONContent>(
    initialData?.jsonDescription ? JSON.parse(initialData.jsonDescription) : defaultEditorContent
  )
  const [htmlDescription, setHtmlDescription] = useState(initialData?.htmlDescription || '')
  const [thumbnail, setThumbnail] = useState<string | null>(initialData?.thumbnail || null)
  const [isLocked, setIsLocked] = useState(initialData?.isLocked ?? false) // Default to free course
  const [price, setPrice] = useState<number | null>(initialData?.price ?? null)
  const [paidCourseMessage, setPaidCourseMessage] = useState<string | null>(initialData?.paidCourseMessage ?? null)
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
    console.log('Form submission started. Current values:');
    console.log('Title:', title);
    console.log('Description:', description);
    console.log('Level:', level);
    console.log('JSON Description:', jsonDescription);
    console.log('HTML Description:', htmlDescription);
    console.log('Event Start Date:', eventStartDate);
    console.log('Event End Date:', eventEndDate);
    console.log('Type:', type);
    
    // Check if jsonDescription has actual content
    const hasValidContent = jsonDescription && 
      jsonDescription.content && 
      jsonDescription.content.length > 0 && 
      jsonDescription.content.some((node: unknown) => 
        typeof node === 'object' && node !== null && 'content' in node && 
        Array.isArray((node as { content: unknown[] }).content) && 
        (node as { content: unknown[] }).content.length > 0
      );

    if (!title || !description || !level || !hasValidContent || !htmlDescription) {
      toast.error('Please fill in all required fields including the detailed description')
      return
    }

    // Validate event course dates
    if (type === CourseType.EVENT) {
      if (!eventStartDate || !eventEndDate) {
        toast.error('Event courses must have both start and end dates')
        return
      }

      const startDate = new Date(eventStartDate)
      const endDate = new Date(eventEndDate)

      if (endDate <= startDate) {
        toast.error('Event end date must be after start date')
        return
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to midnight today

      if (startDate < today) {
        toast.error('Event start date cannot be in the past.')
        return
      }
    }

    setPending(true)

    try {
      const courseData: CourseData = {
        title,
        description,
        level,
        type,
        eventStartDate: type === CourseType.EVENT && eventStartDate ? new Date(eventStartDate) : null,
        eventEndDate: type === CourseType.EVENT && eventEndDate ? new Date(eventEndDate) : null,
        jsonDescription: JSON.stringify(jsonDescription),
        htmlDescription,
        thumbnail,
        isCompleted: false,
        isLocked,
        price,
        paidCourseMessage
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
      console.error('Error in handleSubmit:', error); // Added console.error
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

            {/* Course Type Selector */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <Timer className="text-muted-foreground" size={16} />
                <Select value={type} onValueChange={(value: CourseType) => setType(value)}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Course Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={CourseType.NORMAL}>Normal Course</SelectItem>
                    <SelectItem value={CourseType.EVENT}>Event Course</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Event Date Inputs - Show only for EVENT type */}
              {type === CourseType.EVENT && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Calendar size={16} />
                      <span>Event Start Date</span>
                    </div>
                    <Input
                      type="date"
                      value={eventStartDate}
                      onChange={(e) => setEventStartDate(e.target.value)}
                      className="w-full"
                      required={type === CourseType.EVENT}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Calendar size={16} />
                      <span>Event End Date</span>
                    </div>
                    <Input
                      type="date"
                      value={eventEndDate}
                      onChange={(e) => setEventEndDate(e.target.value)}
                      className="w-full"
                      required={type === CourseType.EVENT}
                    />
                  </div>
                  {type === CourseType.EVENT && (
                    <div className="col-span-full text-sm text-muted-foreground">
                      <p className="flex items-start gap-2">
                        <span className="text-yellow-600">⚠️</span>
                        <span>
                          Event courses are time-limited. Students will be automatically removed and the course will be locked after the end date.
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              )}
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

            {/* Pricing Section - Only show for paid courses */}
            {isLocked && (
              <div className="flex flex-col gap-4 p-4 bg-muted/50 rounded-lg">
                <h3 className="text-lg font-medium">Pengaturan Kelas Berbayar</h3>
                <div className="space-y-2">
                  <label htmlFor="course-price" className="text-sm font-medium">Harga Kelas (IDR)</label>
                  <Input
                    id="course-price"
                    type="number"
                    placeholder="Masukkan harga (contoh: 50000)"
                    value={price === null ? '' : price}
                    onChange={(e) => setPrice(e.target.value === '' ? null : parseInt(e.target.value, 10))}
                    min="0"
                    className="w-full"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Tentukan harga untuk kelas berbayar ini.
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="paid-course-message" className="text-sm font-medium">Pesan untuk Permintaan Bergabung</label>
                  <Textarea
                    id="paid-course-message"
                    placeholder="Masukkan pesan yang akan ditampilkan saat siswa meminta bergabung (contoh: instruksi pembayaran)."
                    value={paidCourseMessage || ''}
                    onChange={(e) => setPaidCourseMessage(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <p className="text-xs text-muted-foreground">
                    Pesan ini akan ditampilkan dalam modal permintaan bergabung untuk kelas berbayar.
                  </p>
                </div>
              </div>
            )}

            {/* Course Type Toggle */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                {isLocked ? (
                  <Lock className="text-muted-foreground" size={20} />
                ) : (
                  <Unlock className="text-muted-foreground" size={20} />
                )}
                <div className="space-y-1">
                  <div className="font-medium">
                    {isLocked ? 'Kelas Berbayar' : 'Kelas Gratis'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {isLocked
                      ? 'Kelas ini membutuhkan pembayaran untuk bergabung'
                      : 'Kelas ini dapat diakses secara gratis'
                    }
                  </div>
                </div>
              </div>
              <Switch
                checked={!isLocked}
                onCheckedChange={(checked) => {
                  setIsLocked(!checked);
                  if (checked) { // If switching to free course
                    setPrice(null);
                    setPaidCourseMessage(null);
                  }
                }}
              />
            </div>

            <Button type="submit" disabled={pending} className="w-full">
              {pending ? 'Menyimpan...' : initialData ? 'Perbarui Kursus' : (isLocked ? 'Buat Kelas Berbayar' : 'Buat Kelas Gratis')}
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
