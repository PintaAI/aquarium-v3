'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Play, Download, Clock } from 'lucide-react'
import { getSessionRecordings } from '@/app/actions/recording-actions'

interface SessionRecordingsProps {
  sessionId: string
  sessionName: string
  isCreator: boolean
}

export function SessionRecordings({ sessionId, sessionName, isCreator }: SessionRecordingsProps) {
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRecordings = async () => {
      try {
        setLoading(true)
        const result = await getSessionRecordings(sessionId)
        
        if (result.success) {
          setRecordingUrl(result.recordingUrl || null)
        } else {
          setError(result.error || 'Failed to fetch recordings')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching recordings')
      } finally {
        setLoading(false)
      }
    }

    fetchRecordings()
  }, [sessionId])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Rekaman Sesi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
            <span className="ml-2 text-muted-foreground">Memuat rekaman...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Rekaman Sesi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!recordingUrl) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Rekaman Sesi
          </CardTitle>
          <CardDescription>
            Rekaman dari sesi live ini
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {isCreator 
                ? "Belum ada rekaman untuk sesi ini. Mulai rekaman saat sesi live berlangsung."
                : "Belum ada rekaman tersedia untuk sesi ini."
              }
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Rekaman Sesi
        </CardTitle>
        <CardDescription>
          Rekaman dari sesi: {sessionName}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="aspect-video rounded-lg overflow-hidden bg-muted">
          <video 
            controls 
            className="w-full h-full object-contain"
            preload="metadata"
          >
            <source src={recordingUrl} type="video/mp4" />
            Browser Anda tidak mendukung pemutar video.
          </video>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Rekaman tersedia</span>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const video = document.querySelector('video')
                if (video) {
                  if (video.paused) {
                    video.play()
                  } else {
                    video.pause()
                  }
                }
              }}
            >
              <Play className="h-4 w-4 mr-1" />
              Putar
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const link = document.createElement('a')
                link.href = recordingUrl
                link.download = `${sessionName}_recording.mp4`
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
              }}
            >
              <Download className="h-4 w-4 mr-1" />
              Unduh
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
