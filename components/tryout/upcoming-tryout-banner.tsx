import Link from "next/link"
import { getUpcomingTryout } from "@/app/actions/tryout-actions"
import { cn } from "@/lib/utils"
import { BlinkingDot } from "../ui/blinking-dot"
import { getRelativeTime } from "@/lib/date-utils"


function getTimeLeft(startTime: Date): string {
  return getRelativeTime(startTime)
}

export async function UpcomingTryoutBanner() {
  const tryout = await getUpcomingTryout()

  if (!tryout) return null
  
  const timeLeft = getTimeLeft(tryout.endTime)

  return (
    <Link 
      href={`/tryout/${tryout.id}`}
      className={cn(
        "bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-blue-500/10",
        "hover:from-blue-500/15 hover:via-blue-500/10 hover:to-blue-500/15",
        "transition-all duration-300 border border-blue-500/20 rounded-lg py-2 px-3 flex items-center gap-3 group"
      )}
    >
      <BlinkingDot color="blue" />
      <div className="flex-1 min-w-0 flex items-center gap-3">
        <p className="text-sm font-medium text-blue-700 truncate">
          {tryout.nama}
          <span className="text-muted-foreground mx-2">•</span>
          <span className="text-muted-foreground">{tryout.koleksiSoal.nama}</span>
        </p>
        <span className="shrink-0 text-xs text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded-full">
          Selesai {timeLeft} ➜
        </span>
      </div>
    </Link>
  )
}
