import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { currentUser } from "@/lib/auth"
import Image from "next/image"
import { getTryout, getTryoutLeaderboard } from "@/app/actions/tryout-actions"
import { DateDisplay } from "@/components/shared"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { notFound } from "next/navigation"
import { FaCrown, FaTrophy } from "react-icons/fa"
import { IoArrowBack, IoStopwatchOutline } from "react-icons/io5"

// Format time taken in MM:SS format
const formatTime = (seconds: number | null): string => {
  if (!seconds) return "-" // Default to 30 minutes if null
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

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

  const userRank = leaderboard.findIndex(entry => entry.userId === user.id) + 1; // Re-added userRank calculation
  const topThree = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  // Find tthe specific ranks for easier access
  const firstPlace = topThree.find((_, index) => index === 0);
  const secondPlace = topThree.find((_, index) => index === 1);
  const thirdPlace = topThree.find((_, index) => index === 2);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8" >
      {/* Tryout Info Header */}
      <div className="mb-4 sm:mb-8 flex flex-col items-center text-center">
        <div className="w-16 h-16 sm:w-20 sm:h-20 mb-2 sm:mb-3 relative">
          <Image
            src="/images/circle-logo.png"
            alt="Logo"
            fill
            className="object-contain"
          />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">{tryout.koleksiSoal.nama}</h1>
          <p className="text-xs text-muted-foreground">
            <DateDisplay date={tryout.startTime} format="dd MMM yyyy HH:mm" /> - <DateDisplay date={tryout.endTime} format="dd MMM yyyy HH:mm" />
          </p>
        </div>
      </div>
      {/* Top 3 Section */}
      {leaderboard.length > 0 && (
        <div className="grid grid-cols-3 md:grid-cols-3 gap-0 md:gap-2 items-end mb-10">
          {/* 2nd Place */}
          <div className="md:order-1 flex justify-center">
            {secondPlace && (
              <Card className="p-2 pt-6 md:p-4 md:pt-8 w-full max-w-[110px] md:max-w-xs bg-gray-100 dark:bg-gray-600/20 border border-gray-200 dark:border-gray-500 rounded-lg md:rounded-xl text-center relative transform transition-transform hover:scale-105">
                <div className="absolute -top-3 md:-top-4 left-1/2 transform -translate-x-1/2 bg-gray-300 dark:bg-gray-500 text-gray-700 dark:text-gray-100 text-[10px] md:text-xs font-semibold px-2 py-0.5 md:px-3 md:py-1 rounded-full">2nd</div>
                <Avatar className="w-12 h-12 md:w-20 md:h-20 mx-auto mb-1 md:mb-3 border-2 md:border-4 border-gray-200 dark:border-gray-500 shadow-sm md:shadow-md">
                  <AvatarImage src={secondPlace.user.image || undefined} />
                  <AvatarFallback>{secondPlace.user.name?.[0] || '?'}</AvatarFallback>
                </Avatar>
                <p className="text-xs md:text-base font-semibold text-foreground truncate">{secondPlace.user.name || 'Anonymous'}</p>
                <p className="text-lg md:text-2xl font-bold text-foreground my-0.5 md:my-1">{secondPlace.score}</p>
                <p className="text-[10px] md:text-xs text-muted-foreground flex items-center justify-center gap-0.5 md:gap-1">
                  <IoStopwatchOutline className="w-3 h-3 md:w-auto md:h-auto"/> {/* Adjusted icon size */} {formatTime(secondPlace.timeTakenSeconds)}
                </p>
              </Card>
            )}
          </div>

          {/* 1st Place */}
          <div className="md:order-2 flex justify-center">
            {firstPlace && (
              <Card className="p-3 pt-8 md:p-6 md:pt-10 w-full max-w-[130px] md:max-w-xs bg-yellow-100 dark:bg-yellow-500/20 border border-yellow-300 dark:border-yellow-500 rounded-lg md:rounded-xl text-center relative shadow-xl transform transition-transform hover:scale-110 z-10 first-place-glow">
                <div className="absolute -top-4 md:-top-5 left-1/2 transform -translate-x-1/2 text-yellow-500 dark:text-yellow-300">
                  <FaCrown size={24} className="md:size-auto"/>
                </div>
                <Avatar className="w-16 h-16 md:w-24 md:h-24 mx-auto mb-2 md:mb-4 border-2 md:border-4 border-yellow-300 dark:border-yellow-700 shadow-md md:shadow-lg">
                  <AvatarImage src={firstPlace.user.image || undefined} />
                  <AvatarFallback>{firstPlace.user.name?.[0] || '?'}</AvatarFallback>
                </Avatar>
                <p className="text-sm md:text-base font-semibold text-foreground truncate">{firstPlace.user.name || 'Anonymous'}</p>
                <p className="text-xl md:text-3xl font-bold text-foreground my-0.5 md:my-1">{firstPlace.score}</p>
                <p className="text-xs md:text-sm text-muted-foreground flex items-center justify-center gap-0.5 md:gap-1">
                  <IoStopwatchOutline className="w-3 h-3 md:w-auto md:h-auto"/> {/* Adjusted icon size */} {formatTime(firstPlace.timeTakenSeconds)}
                </p>
              </Card>
            )}
          </div>

          {/* 3rd Place */}
          <div className="md:order-3 flex justify-center">
            {thirdPlace && (
              <Card className="p-2 pt-6 md:p-4 md:pt-8 w-full max-w-[110px] md:max-w-xs bg-orange-100 dark:bg-orange-500/20 border border-orange-200 dark:border-orange-500 rounded-lg md:rounded-xl text-center relative transform transition-transform hover:scale-105">
                <div className="absolute -top-3 md:-top-4 left-1/2 transform -translate-x-1/2 bg-orange-300 dark:bg-orange-500 text-orange-800 dark:text-orange-100 text-[10px] md:text-xs font-semibold px-2 py-0.5 md:px-3 md:py-1 rounded-full">3rd</div>
                <Avatar className="w-12 h-12 md:w-20 md:h-20 mx-auto mb-1 md:mb-3 border-2 md:border-4 border-orange-200 dark:border-orange-500 shadow-sm md:shadow-md">
                  <AvatarImage src={thirdPlace.user.image || undefined} />
                  <AvatarFallback>{thirdPlace.user.name?.[0] || '?'}</AvatarFallback>
                </Avatar>
                <p className="text-xs md:text-base font-semibold text-foreground truncate">{thirdPlace.user.name || 'Anonymous'}</p>
                <p className="text-lg md:text-2xl font-bold text-foreground my-0.5 md:my-1">{thirdPlace.score}</p>
                <p className="text-[10px] md:text-xs text-muted-foreground flex items-center justify-center gap-0.5 md:gap-1">
                  <IoStopwatchOutline className="w-3 h-3 md:w-auto md:h-auto"/> {/* Adjusted icon size */} {formatTime(thirdPlace.timeTakenSeconds)}
                </p>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Ranks 4+ List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <FaTrophy className="text-muted-foreground" />
            Ranking
          </h3>
          <Link href={`/tryout/`}>
            <Button variant="ghost" size="sm">
              <IoArrowBack className="mr-1 h-4 w-4" />
              Kembali
            </Button>
          </Link>
        </div>

        {leaderboard.length === 0 ? (
          <Card className="text-center py-12 text-muted-foreground">
            Belum ada yang berpartisipasi dalam tryout ini.
          </Card>
        ) : rest.length === 0 && topThree.length > 0 ? (
           <Card className="text-center py-12 text-muted-foreground">
            Hanya ada {topThree.length} peserta dalam leaderboard.
          </Card>
        ) : (
          <Card className="p-2 sm:p-4">
            <div className="space-y-2">
              {rest.map((entry, index) => (
                <div
                  key={entry.userId}
                  className={`flex items-center justify-between p-3 rounded-lg transition-colors duration-150 border shadow-sm ${ // Added border and shadow-sm
                    (index + 4) === userRank ? 'bg-primary/10 dark:bg-primary/5 border-primary/20' : 'bg-card hover:bg-muted/50 border-border' // Adjusted for dark mode
                  }`}
                >
                  <div className="flex items-start gap-3 sm:gap-4"> {/* Changed items-center to items-start */}
                    <div className="w-8 text-left text-lg font-bold text-primary">#{index + 4}</div> {/* Increased width and changed text-center to text-left */}
                    <Avatar className="w-10 h-10 sm:w-12 sm:h-12">
                      <AvatarImage src={entry.user.image || undefined} />
                      <AvatarFallback>
                        {entry.user.name?.[0] || entry.user.email?.[0]?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 flex flex-col"> {/* Added flex flex-col */}
                      <p className="font-bold text-sm sm:text-base truncate">{entry.user.name || entry.user.email || 'Anonymous'}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
                         <IoStopwatchOutline className="h-3.5 w-3.5" /> {formatTime(entry.timeTakenSeconds)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right ml-2">
                    <p className="text-base sm:text-lg font-bold text-foreground">{entry.score}</p>
                    <p className="text-xs text-muted-foreground">Points</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
