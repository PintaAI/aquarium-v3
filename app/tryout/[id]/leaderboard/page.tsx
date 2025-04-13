import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { currentUser } from "@/lib/auth"
import Image from "next/image"
import { getTryout, getTryoutLeaderboard } from "@/app/actions/tryout-actions"
import { DateDisplay } from "@/components/shared"
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
    <div >
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="w-24 h-24 mb-4 relative">
          <Image
            src="/images/circle-logo.png"
            alt="Logo"
            fill
            className="object-contain"
          />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{tryout.koleksiSoal.nama}</h1>
          <p className="text-sm text-muted-foreground">
            <DateDisplay date={tryout.startTime} format="PPP p" /> - <DateDisplay date={tryout.endTime} format="PPP p" />
          </p>
          <div className="pt-2">
            <Link href={`/tryout/`}>
              <Button variant="outline">Kembali</Button>
            </Link>
          </div>
        </div>
      </div>

      {user.role === "MURID" && userRank > 0 && (
        <Card className="p-4 mb-6 bg-primary text-primary-foreground">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-2">
                  <div className="flex items-center gap-2 sm:gap-4">
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
        <h2 className="text-xl font-semibold ml-2">Ranking</h2>
        
        {leaderboard.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">
            No submissions yet
          </p>
        ) : (
          <div className="space-y-2 m-2">
            {leaderboard.map((entry, index) => (
              <Card 
                key={entry.userId} 
                className={`p-4 transition-all duration-300 ${
                  entry.userId === user.id ? 'bg-accent' : 
                  index === 0 ? 'bg-gradient-to-r from-yellow-500/10 via-yellow-500/5 to-yellow-500/10 border-yellow-500/30 hover:border-yellow-500/50' :
                  index === 1 ? 'bg-gradient-to-r from-gray-400/10 via-gray-400/5 to-gray-400/10 border-gray-400/30 hover:border-gray-400/50' :
                  index === 2 ? 'bg-gradient-to-r from-amber-600/10 via-amber-600/5 to-amber-600/10 border-amber-600/30 hover:border-amber-600/50' : ''
                } ${
                  index <= 2 ? 'hover:shadow-lg transform hover:-translate-y-0.5' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 flex items-center justify-center">
                      <div className={`text-xl font-bold flex items-center justify-center ${
                        index === 0 ? 'text-yellow-500' :
                        index === 1 ? 'text-gray-400' :
                        index === 2 ? 'text-amber-600' : ''
                      }`}>
                        {index === 0 ? (
                          <div className="flex flex-col items-center">
                            <span className="text-2xl">🥇</span>
                            <span className="text-sm">1st</span>
                          </div>
                        ) : index === 1 ? (
                          <div className="flex flex-col items-center">
                            <span className="text-2xl">🥈</span>
                            <span className="text-sm">2nd</span>
                          </div>
                        ) : index === 2 ? (
                          <div className="flex flex-col items-center">
                            <span className="text-2xl">🥉</span>
                            <span className="text-sm">3rd</span>
                          </div>
                        ) : (
                          <span>#{index + 1}</span>
                        )}
                      </div>
                    </div>
                    <Avatar>
                      <AvatarImage src={entry.user.image || undefined} />
                      <AvatarFallback>
                        {entry.user.name?.[0] || entry.user.email?.[0]?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium flex flex-wrap items-center gap-2 min-w-0">
                        <span className="truncate">
                          {entry.user.name || entry.user.email || 'Anonymous'}
                        </span>
                        {index === 0 ? (
                          <span className="text-[10px] sm:text-xs font-medium text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-full animate-pulse whitespace-nowrap">
                            👑 Champion!
                          </span>
                        ) : index === 1 ? (
                          <span className="text-[10px] sm:text-xs font-medium text-gray-400 bg-gray-400/10 px-2 py-0.5 rounded-full whitespace-nowrap">
                            Runner Up
                          </span>
                        ) : index === 2 ? (
                          <span className="text-[10px] sm:text-xs font-medium text-amber-600 bg-amber-600/10 px-2 py-0.5 rounded-full whitespace-nowrap">
                            Third Place
                          </span>
                        ) : null}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Submitted <DateDisplay date={entry.submittedAt!} relative />
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col">
                    <p className={`text-lg mr-2 sm:text-xl font-bold ${
                      index === 0 ? 'text-yellow-500' :
                      index === 1 ? 'text-gray-400' :
                      index === 2 ? 'text-amber-600' : ''
                    }`}>
                      {entry.score}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">Points</p>
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
