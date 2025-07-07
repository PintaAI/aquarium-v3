'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Download, Clock, Video, Calendar, Trash2 } from 'lucide-react'
import { DateDisplay } from '@/components/shared'
import { deleteRecording } from '@/app/actions/recording-actions'
import { toast } from 'sonner'
import { useState } from 'react'

interface LiveSession {
  id: string
  name: string
  description: string | null
  recordingUrl: string | null
  actualStart: Date | null
  actualEnd: Date | null
  createdAt: Date
  creator: {
    id: string
    name: string | null
    image: string | null
  }
}

interface CourseRecordingsProps {
  liveSessions: LiveSession[]
  courseName: string
  isJoined: boolean
  currentUser?: {
    id: string
    name?: string | null
    role?: string
  } | null
}

export function CourseRecordings({ liveSessions, courseName, isJoined, currentUser }: CourseRecordingsProps) {
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null)
  const [sessionsWithRecordings, setSessionsWithRecordings] = useState(liveSessions)

  const handleDeleteRecording = async (sessionId: string, sessionName: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus rekaman "${sessionName}"? Tindakan ini tidak dapat dibatalkan.`)) {
      return
    }

    try {
      setDeletingSessionId(sessionId)
      const result = await deleteRecording(sessionId)
      
      if (result.success) {
        // Update the local state to remove the recording URL
        setSessionsWithRecordings(prev => 
          prev.map(session => 
            session.id === sessionId 
              ? { ...session, recordingUrl: null }
              : session
          )
        )
        toast.success('Rekaman berhasil dihapus')
      } else {
        toast.error(result.error || 'Gagal menghapus rekaman')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat menghapus rekaman')
    } finally {
      setDeletingSessionId(null)
    }
  }
  if (!isJoined) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Rekaman Live Session
          </CardTitle>
          <CardDescription>
            Rekaman sesi live dari kursus ini
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Bergabung dengan kursus untuk mengakses rekaman live session
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (liveSessions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Rekaman Live Session
          </CardTitle>
          <CardDescription>
            Rekaman sesi live dari kursus ini
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Belum ada rekaman live session tersedia untuk kursus ini
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
          <Video className="h-5 w-5" />
          Rekaman Live Session
        </CardTitle>
        <CardDescription>
          {liveSessions.length} rekaman tersedia dari {courseName}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {sessionsWithRecordings.map((session) => (
          <div key={session.id} className="border rounded-lg p-4 space-y-3">
            {/* Session Header */}
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="font-semibold text-sm">{session.name}</h3>
                {session.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {session.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {session.actualStart && (
                  <DateDisplay date={session.actualStart} format="dd MMM yyyy" />
                )}
              </div>
            </div>

            {/* Creator Info */}
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage 
                  src={session.creator.image || ''} 
                  alt={session.creator.name || 'Creator'} 
                />
                <AvatarFallback className="text-xs">
                  {(session.creator.name || 'U').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">
                oleh {session.creator.name || 'Unknown'}
              </span>
              {session.actualStart && session.actualEnd && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>
                      {Math.round(
                        (new Date(session.actualEnd).getTime() - 
                         new Date(session.actualStart).getTime()) / 
                        (1000 * 60)
                      )} menit
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Video Player */}
            {session.recordingUrl && (
              <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                <video 
                  controls 
                  className="w-full h-full object-contain"
                  preload="metadata"
                  poster="/placeholder-video.jpg"
                >
                  <source src={session.recordingUrl} type="video/mp4" />
                  Browser Anda tidak mendukung pemutar video.
                </video>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Rekaman tersedia</span>
              </div>
              
              <div className="flex gap-2">
                {session.recordingUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const link = document.createElement('a')
                      link.href = session.recordingUrl!
                      link.download = `${session.name}_${courseName}.mp4`
                      document.body.appendChild(link)
                      link.click()
                      document.body.removeChild(link)
                    }}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Unduh
                  </Button>
                )}
                
                {/* Delete button - only show for GURU role users */}
                {currentUser && currentUser.role === 'GURU' && session.recordingUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDeleteRecording(session.id, session.name)}
                    disabled={deletingSessionId === session.id}
                  >
                    {deletingSessionId === session.id ? (
                      <div className="h-4 w-4 mr-1 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-1" />
                    )}
                    {deletingSessionId === session.id ? 'Menghapus...' : 'Hapus'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
