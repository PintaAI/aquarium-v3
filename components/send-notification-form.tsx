'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { sendNotification } from '@/app/actions/push-notifications'

interface NotificationFormData {
  userId: string
  title: string
  message: string
  sendToAll: boolean
}

export function SendNotificationForm() {
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<NotificationFormData>()

  const onSubmit = async (data: NotificationFormData) => {
    try {
      setIsSending(true)
      setError(null)
      setSuccess(false)

      await sendNotification(data.sendToAll ? 'all' : data.userId, data.title, data.message)
      
      setSuccess(true)
      reset() // Reset form after successful submission
    } catch (err) {
      setError('Failed to send notification. Please try again.')
      console.error('Notification error:', err)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="rounded-lg border p-4">
      <h3 className="text-lg font-semibold mb-4">Send Push Notification</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              {...register('sendToAll')}
              id="sendToAll"
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="sendToAll" className="text-sm font-medium">
              Send to all users
            </label>
          </div>

          {!watch('sendToAll') && (
            <div>
              <Input
                {...register('userId', { 
                  required: !watch('sendToAll') && 'User ID is required' 
                })}
                placeholder="User ID"
                className="w-full"
              />
              {errors.userId && (
                <p className="text-sm text-destructive mt-1">{errors.userId.message}</p>
              )}
            </div>
          )}
        </div>

        <div>
          <Input
            {...register('title', { required: 'Title is required' })}
            placeholder="Notification Title"
            className="w-full"
          />
          {errors.title && (
            <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
          )}
        </div>

        <div>
          <Textarea
            {...register('message', { required: 'Message is required' })}
            placeholder="Notification Message"
            className="w-full min-h-[100px]"
          />
          {errors.message && (
            <p className="text-sm text-destructive mt-1">{errors.message.message}</p>
          )}
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        {success && (
          <p className="text-sm text-green-600">Notification sent successfully!</p>
        )}

        <Button type="submit" disabled={isSending}>
          {isSending ? 'Sending...' : 'Send Notification'}
        </Button>
      </form>
    </div>
  )
}
