import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { currentUser } from "@/lib/auth"
import { getTryout, getTryoutLeaderboard } from "@/app/actions/tryout-actions"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { notFound } from "next/navigation"

interface Props {
  params: Promise<{
    id: string
  }>
}

export default async function LeaderboardPage(props: Props) {
  const params = await props.params;
  const user = await currentUser()
  if (!user?.id || !user?.role || !["GURU", "MURID", "ADMIN"].includes(user.role)) {
    return null
  }

  const tryoutId = parseInt(params.id)
  const tryout = await getTryout(tryoutId)
  if (!tryout) notFound()

  const leaderboard = await getTryoutLeaderboard(tryoutId)
  if (!leaderboard) return null

  const userRank = leaderboard.findIndex(entry => entry.userId === user.id) + 1

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{tryout.koleksiSoal.nama}</h1>
          <p className="text-sm text-muted-foreground">
            {formatDate(tryout.startTime)} - {formatDate(tryout.endTime)}
          </p>
        </div>
        <Link href={`/tryout/${tryoutId}`}>
          <Button variant="outline">Back to Tryout</Button>
        </Link>
      </div>

      {user.role === "MURID" && userRank > 0 && (
        <Card className="p-4 mb-6 bg-primary text-primary-foreground">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-2xl font-bold">#{userRank}</div>
              <Avatar>
                <AvatarImage src={user.image || undefined} />
                <AvatarFallback>
                  {user.name?.[0] || user.email?.[0]?.toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{user.name || user.email || 'Anonymous'}</p>
                <p className="text-sm opacity-90">Your Rank</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">
                {leaderboard[userRank - 1].score}
              </p>
              <p className="text-sm opacity-90">Points</p>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Leaderboard</h2>
        
        {leaderboard.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">
            No submissions yet
          </p>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((entry, index) => (
              <Card 
                key={entry.userId} 
                className={`p-4 ${entry.userId === user.id ? 'bg-accent' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-xl font-bold w-8">#{index + 1}</div>
                    <Avatar>
                      <AvatarImage src={entry.user.image || undefined} />
                      <AvatarFallback>
                        {entry.user.name?.[0] || entry.user.email?.[0]?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{entry.user.name || entry.user.email || 'Anonymous'}</p>
                      <p className="text-sm text-muted-foreground">
                        Submitted {formatDate(entry.submittedAt!)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">{entry.score}</p>
                    <p className="text-sm text-muted-foreground">Points</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
