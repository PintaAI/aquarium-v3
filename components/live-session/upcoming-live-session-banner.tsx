import Link from "next/link"
import { toLocalTime, getRelativeTime } from "@/lib/date-utils"
import { cn } from "@/lib/utils"
import { BlinkingDot } from "../ui/blinking-dot"
import { getLiveSessions } from "@/app/actions/live-session-actions"

function getTimeLeft(startTime: Date): string {
  return getRelativeTime(toLocalTime(startTime))
}

export async function UpcomingLiveSessionBanner() {
  const { active, scheduled } = await getLiveSessions()
  
  // Prioritize active sessions over scheduled ones
  const session = active[0] || scheduled[0]
  
  if (!session) return null
  
  const isLive = session.status === 'LIVE'
  const timeLeft = isLive ? null : getTimeLeft(session.scheduledStart)

  // Define common classes and content
  const commonClasses = "transition-all duration-300 border border-emerald-500/20 rounded-lg py-2 px-3 flex items-center gap-3 group";
  const liveClasses = "bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-emerald-500/10 hover:from-emerald-500/15 hover:via-emerald-500/10 hover:to-emerald-500/15";
  const scheduledClasses = "bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-emerald-500/10 cursor-default"; // No hover, default cursor

  const BannerContent = () => (
    <>
      <BlinkingDot color={isLive ? "blue" : "emerald"} />
      <div className="flex-1 min-w-0">
        {/* Apply overflow-hidden here to contain the marquee */}
        <div className="text-sm font-medium whitespace-nowrap overflow-hidden">
          {/* Always animate if content overflows, duplicate content for seamless loop */}
          <div className="animate-marquee inline-block">
            {/* Original Content */}
            <span className={cn(
              isLive ? "text-emerald-950-700" : "text-emerald-700"
            )}>
              {session.name}
            </span>
            <span className="text-muted-foreground mx-2">•</span>
            <span className="text-muted-foreground">{session.course.title}</span>
            {/* Duplicate Content for seamless loop - add spacing */}
            <span className="inline-block w-8"></span> {/* Add some space */}
            <span className={cn(
              isLive ? "text-emerald-950-700" : "text-emerald-700"
            )}>
              {session.name}
            </span>
            <span className="text-muted-foreground mx-2">•</span>
            <span className="text-muted-foreground">{session.course.title}</span>
          </div>
        </div>
      </div>
      <span className={cn(
        "shrink-0 text-xs px-2 py-0.5 rounded-full",
        isLive 
          ? "text-red-600 bg-red-500/10 animate-pulse"
          : "text-emerald-600 bg-emerald-500/10"
      )}>
        {isLive ? "Join Sekarang ▶" : `Dimulai ${timeLeft} ➜`}
      </span>
    </>
  );

  // Conditionally render Link or div
  return isLive ? (
    <Link 
      href={`/dashboard/live-session/${session.id}`}
      className={cn(commonClasses, liveClasses)}
    >
      <BannerContent />
    </Link>
  ) : (
    <div className={cn(commonClasses, scheduledClasses)}>
      <BannerContent />
    </div>
  );
}
