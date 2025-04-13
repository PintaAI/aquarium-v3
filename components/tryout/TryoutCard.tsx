import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
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
import { Trash2 } from "lucide-react"

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
    upcoming: 'Upcoming',
    active: 'Active',
    ended: 'Ended'  
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
      className="hover:shadow-md transition-shadow cursor-pointer relative"
      onClick={handleCardClick}
    >
      {canDelete && (
        <div className="absolute top-3 right-3 z-10">
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
                  Are you sure you want to delete this tryout? This action cannot be undone.
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
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{koleksiSoal.nama}</span>
          <Badge className={statusColors[status]}>
            {statusText[status]}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-sm">
            <span className="font-semibold">Start:</span> <DateDisplay date={startTime} />
          </div>
          <div className="text-sm">
            <span className="font-semibold">End:</span> <DateDisplay date={endTime} />
          </div>
          {showParticipantCount && (
            <div className="text-sm">
              <span className="font-semibold">Participants:</span> {participants.length}
            </div>
          )}
          {(userParticipation || isGuru) && (
            <div className="mt-4 space-y-2">
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
