'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { startLiveSession } from '@/app/actions/live-session-actions'
import { toast } from 'sonner'

interface StartSessionButtonProps {
  sessionId: string
}

export function StartSessionButton({ sessionId }: StartSessionButtonProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const onClick = () => {
    startTransition(async () => {
      const result = await startLiveSession(sessionId)
      
      if (result.success) {
        toast.success('Session started successfully')
        // Navigate to session page
        router.push(`/dashboard/live-session/${sessionId}`)
      } else {
        toast.error(result.error || 'Failed to start session')
      }
    })
  }

  return (
    <Button 
      className="w-full" 
      variant="default"
      disabled={isPending}
      onClick={onClick}
    >
      {isPending ? 'Starting...' : 'Start Session'}
    </Button>
  )
}
