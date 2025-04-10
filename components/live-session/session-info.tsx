"use client"
// Removed Button import as it's only needed for Show More/Less now
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
// Removed Lucide icons for buttons
import { useState } from "react"
// Removed Stream imports: Call, useCallStateHooks
// Removed useRouter import

interface SessionInfoProps {
  // Removed call prop
  name: string
  description: string | null
  courseTitle: string
  status: string
  instructor: {
    name: string
    image?: string
  }
  startTime: Date
  viewCount?: number
}

export function SessionInfo({
  // Removed call prop
  name,
  description,
  courseTitle,
  status,
  instructor,
  startTime,
  viewCount = 0
}: SessionInfoProps) {
  // Removed router instance
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)

  // Removed Stream hooks usage

  function formatDate(date: Date) {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date)
  }

  function formatViewCount(count: number) {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M views`
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K views`
    }
    return `${count} views`
  }

  // Removed handleExit function

  const shortDescription = description && description.length > 50
    ? description.slice(0, 24) + "..."
    : description

  return (
    <div className="space-y-4 p-3 pb-0">
      {/* Header without buttons */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-xl font-semibold leading-tight sm:text-2xl">
            {name}
          </h1>
          <Badge variant={status === 'LIVE' ? 'destructive' : 'outline'}>{status}</Badge>
        </div>
        {/* Control buttons removed */}
      </div>

      {/* Meta information */}
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <span>{formatViewCount(viewCount)}</span>
        <span>•</span>
        <span>{formatDate(startTime)}</span>
      </div>

      {/* Instructor info and description */}
      <div className="flex flex-col gap-4 rounded-lg bg-muted/10 p-3">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={instructor.image} alt={instructor.name} />
            <AvatarFallback>{instructor.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{instructor.name}</span>
            <span className="text-sm text-muted-foreground">{courseTitle}</span>
          </div>
        </div>

        {description && (
          <div>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {isDescriptionExpanded ? description : shortDescription}
            </p>
            {description && description.length > 24 && (
              <Button // Keep Button import for this
                variant="link"
                className="px-0 text-sm h-auto"
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
              >
                {isDescriptionExpanded ? 'Show less' : 'Show more'}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
