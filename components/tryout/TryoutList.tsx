"use client"
import { Tryout, TryoutParticipant } from "@prisma/client"
import { TryoutCard } from "./TryoutCard"

interface TryoutWithRelations extends Tryout {
  koleksiSoal: {
    nama: string
  }
  participants: TryoutParticipant[]
}

interface TryoutListProps {
  tryouts: TryoutWithRelations[]
  userId?: string
  showParticipantCount?: boolean
  isGuru?: boolean
  userRole?: string | null
}

export function TryoutList({ 
  tryouts,
  userId,
  showParticipantCount = true,
  isGuru = false,
  userRole
}: TryoutListProps) {
  if (!tryouts.length) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        No tryouts available
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tryouts.map((tryout) => {
        const userParticipation = userId 
          ? tryout.participants.find(p => p.userId === userId)
          : null

        return (
          <TryoutCard
            key={tryout.id}
            id={tryout.id}
            startTime={tryout.startTime}
            endTime={tryout.endTime}
            koleksiSoal={tryout.koleksiSoal}
            participants={tryout.participants}
            userParticipation={userParticipation}
            showParticipantCount={showParticipantCount}
            isGuru={isGuru}
            userRole={userRole}
          />
        )
      })}
    </div>
  )
}
