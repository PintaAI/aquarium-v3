'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatForInput } from '@/lib/date-utils'
import { parseISO } from 'date-fns'
import { z } from 'zod'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { createLiveSession, type CreateSessionInput } from '@/app/actions/live-session-actions'
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Video } from 'lucide-react'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  scheduledStart: z.string().min(1, 'Start time is required'),
  scheduledEnd: z.string().optional(),
})

interface StartLiveSessionButtonProps {
  courseId: number
  courseName: string
  isAuthor: boolean
}

export function StartLiveSessionButton({ courseId, courseName, isAuthor }: StartLiveSessionButtonProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: `Live Session - ${courseName}`,
      description: "",
      scheduledStart: formatForInput(new Date()),
    }
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      const sessionData: CreateSessionInput = {
        ...data,
        courseId: courseId,
        scheduledStart: parseISO(data.scheduledStart),
        scheduledEnd: data.scheduledEnd ? parseISO(data.scheduledEnd) : undefined
      }

      const result = await createLiveSession(sessionData)

      if (result.success) {
        toast.success("Live session created successfully")
        setOpen(false)
        router.push('/dashboard/live-session')
        router.refresh()
      } else {
        toast.error(result.error || "Failed to create live session")
      }
    } catch (error) {
      console.error("Date conversion error:", error)
      toast.error("Invalid date format. Please check the date and time inputs.")
    }
  }

  if (!isAuthor) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Video className="h-4 w-4" />
          Start Live Session
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Start Live Session</DialogTitle>
          <DialogDescription>
            Create a live session for <strong>{courseName}</strong>
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Session Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter session name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter session description" 
                      {...field} 
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="scheduledStart"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="scheduledEnd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="datetime-local" 
                        {...field} 
                        value={field.value || ''} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Create Session
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
