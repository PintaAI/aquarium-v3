"use client"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Mic, ScreenShare, LogOut } from "lucide-react"
import { useState } from "react"

interface SessionInfoProps {
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
  name, 
  description, 
  courseTitle, 
  status,
  instructor,
  startTime,
  viewCount = 0
}: SessionInfoProps) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)

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

  const shortDescription = description && description.length > 200 
    ? description.slice(0, 200) + "..."
    : description

  return (
    <div className="space-y-4 p-3 pb-0">
      <div className="flex justify-between items-center">
        {/* Title */}
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold leading-tight sm:text-2xl">
            {name}
          </h1>
          <Badge variant="outline" className="bg-destructive text-white">{status}</Badge>
        </div>
        
        {/* Control buttons */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Mic className="h-4 w-4" />
            <span className="hidden sm:inline">Mic</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <ScreenShare className="h-4 w-4" />
            <span className="hidden sm:inline">Screen</span>
          </Button>
          <Button variant="destructive" size="sm" className="gap-2">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Exit</span>
          </Button>
        </div>
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
            {description.length > 200 && (
              <Button 
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
