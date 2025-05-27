import { Card, CardContent,} from "../ui/card"
import { getCurrentLocalTime } from "@/lib/date-utils"
import { DateDisplay } from "../shared/date-display"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { useRouter } from "next/navigation"
import { deleteTryout } from "@/app/actions/tryout-actions"
import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog"
import { Trash2, GraduationCap } from "lucide-react"

interface TryoutCardProps {
  userRole?: string | null
  id: number
  startTime: Date
  endTime: Date
  koleksiSoal: {
    nama: string
  }
  participants: Array<{
    id: number
    userId: string
    score: number
    submittedAt: Date | null
    timeTakenSeconds: number | null
    user: {
      name: string | null
      email: string | null
      image: string | null
    }
  }>
  userParticipation?: {
    score: number | null
    submittedAt: Date | null
  } | null
  showParticipantCount?: boolean
  isGuru?: boolean
}

export function TryoutCard({
  id,
  startTime,
  endTime,
  koleksiSoal,
  participants,
  userParticipation,
  showParticipantCount = true,
  isGuru = false,
  userRole
}: TryoutCardProps) {
  const router = useRouter()
  const now = getCurrentLocalTime()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const canDelete = userRole === "GURU" || userRole === "ADMIN"
  let status: 'upcoming' | 'active' | 'ended' = 'upcoming'
  
  if (now > endTime) {
    status = 'ended'
  } else if (now >= startTime) {
    status = 'active'
  }

  const statusColors = {
    upcoming: 'bg-blue-500',
    active: 'bg-green-500',
    ended: 'bg-gray-500'
  }

  const statusText = {
    upcoming: 'Akan Datang',
    active: 'Aktif',
    ended: 'Selesai'  
  }

  const handleCardClick = () => {
    router.push(`/tryout/${id}`)
  }

  const handleLeaderboardClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/tryout/${id}/leaderboard`)
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await deleteTryout(id)
    } catch (error) {
      console.error("Failed to delete tryout:", error)
    }
    setIsDeleteDialogOpen(false)
  }

  return (
    <Card 
      className="group relative bg-card overflow-hidden rounded-lg border border-border transition-all duration-200 hover:shadow-lg hover:shadow-primary/50 hover:-translate-y-1 cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="relative h-32 w-full overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 z-10">
          <div className="absolute top-4 left-3 right-3 flex items-center justify-between gap-3">
            <h3 className="text-lg font-bold group-hover:text-primary transition-colors line-clamp-1">
              {koleksiSoal.nama}
            </h3>
            <Badge className={`${statusColors[status]} shrink-0`}>
              {statusText[status]}
            </Badge>
          </div>
        </div>
        <div className="absolute inset-0">
          <div className="absolute inset-0 rounded-b-sm bg-gradient-to-br from-primary/20 via-primary/10 to-primary/20 opacity-80">
            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/20 rounded-full blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-primary/20 rounded-full blur-2xl" />
            {/* Icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <GraduationCap className="h-12 w-12 text-primary/40 group-hover:text-primary/60 transition-colors translate-y-4" />
            </div>
            {/* Dates */}
            <div className="absolute bottom-2 left-3 right-3 flex justify-between text-xs text-primary/60">
              <DateDisplay date={startTime} format="Pp" />
              <DateDisplay date={endTime} format="Pp" />
            </div>
          </div>
        </div>
      </div>
      {canDelete && (
        <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation()
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Tryout</AlertDialogTitle>
                <AlertDialogDescription>
                 Yakin ingin menghapus tryout ini? Tindakan ini tidak dapat dibatalkan.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
      <CardContent className="p-4">
        <div className="space-y-2 text-muted-foreground">
          {showParticipantCount && (
            <div className="text-sm">
              <span className="font-semibold text-foreground">Submitted:</span>{" "}
              {participants.filter(p => p.submittedAt !== null).length}
            </div>
          )}
          {status === 'ended' && (
            <div className="mt-2 space-y-1.5 mb-4">
              {[...participants]
                .sort((a, b) => {
                  // First sort by score (descending)
                  if (b.score !== a.score) {
                    return b.score - a.score;
                  }
                  // If scores are equal, sort by time taken or submission time
                  if (a.timeTakenSeconds !== null && b.timeTakenSeconds !== null) {
                    return a.timeTakenSeconds - b.timeTakenSeconds; // faster completion first
                  }
                  // If one has timeTakenSeconds and the other doesn't, prioritize the one with timeTakenSeconds
                  if (a.timeTakenSeconds !== null) return -1;
                  if (b.timeTakenSeconds !== null) return 1;
                  // If neither has timeTakenSeconds, use submittedAt
                  if (a.submittedAt && b.submittedAt) {
                    return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
                  }
                  // If one doesn't have submittedAt, put it last
                  if (!a.submittedAt) return 1;
                  if (!b.submittedAt) return -1;
                  return 0;
                })
                .slice(0, 3)
                .map((participant, index) => (
                  <div 
                    key={participant.userId}
                    className={`text-xs flex items-center justify-between rounded px-2 py-1 ${
                      index === 0 ? 'bg-yellow-500/10 text-yellow-500' :
                      index === 1 ? 'bg-gray-400/10 text-gray-400' :
                      'bg-amber-600/10 text-amber-600'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}</span>
                      <span className="truncate max-w-[120px]">
                        {participant.user.name || participant.user.email || 'Anonymous'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{participant.score}</span>
                      {participant.timeTakenSeconds && (
                        <span className="text-xs opacity-75">({Math.floor(participant.timeTakenSeconds / 60)}:{(participant.timeTakenSeconds % 60).toString().padStart(2, '0')})</span>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}

          {(userParticipation || isGuru) && (
            <div className="space-y-2">
              {userParticipation?.submittedAt ? (
                <>
                  <div className="text-sm">
                    <span className="font-semibold">Your Score:</span>{" "}
                    {userParticipation.score} points
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={handleLeaderboardClick}
                  >
                    View Leaderboard
                  </Button>
                </>
              ) : isGuru ? (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={handleLeaderboardClick}
                >
                  View Leaderboard
                </Button>
              ) : (
                <Badge variant="outline">Not submitted</Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
