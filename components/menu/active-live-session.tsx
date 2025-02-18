"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import { Users } from "lucide-react"

interface Room {
  id: string
  title: string
  createdAt: Date
  host: {
    name: string | null
    image: string | null
  }
}

interface ActiveLiveSessionProps {
  rooms: Room[]
  isLoading?: boolean
}

export function ActiveLiveSession({ rooms, isLoading = false }: ActiveLiveSessionProps) {
  return (
    <Card className="col-span-3 border-none shadow-none">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-xl sm:text-2xl">Live Sessions</CardTitle>
            <CardDescription className="text-sm">Currently active study rooms</CardDescription>
          </div>
          <Link href="/room">
            <Badge variant="outline" className="rounded-lg text-muted-foreground text-xs sm:text-sm">
              View All
            </Badge>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[450px] pr-4 -mr-4">
          <div className="space-y-4">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-lg border p-3">
                    <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                    <div className="space-y-2 flex-1 min-w-0">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-1/4 mt-2" />
                    </div>
                    <Skeleton className="h-16 w-16 rounded-md shrink-0" />
                  </div>
                ))
              : rooms.map((room) => (
                  <Link key={room.id} href={`/room/${room.id}`} className="block">
                    <div className="flex items-start gap-3 rounded-lg border p-3 transition-all duration-200 hover:bg-muted/50 hover:shadow-sm">
                      <Avatar className="mt-1 border shrink-0 h-10 w-10">
                        <AvatarImage src={room.host.image ?? ""} alt={room.host.name ?? "Host"} />
                        <AvatarFallback>{room.host.name?.[0] ?? "H"}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1 flex-1 min-w-0">
                        <p className="text-base sm:text-lg font-medium leading-tight line-clamp-2">{room.title}</p>
                        <div className="flex items-center gap-2 pt-1 sm:pt-2">
                          <span className="text-xs font-medium text-muted-foreground truncate max-w-[100px] sm:max-w-none">
                            {room.host.name ?? "Anonymous"}
                          </span>
                          <span className="text-xs text-muted-foreground/60">•</span>
                          <time className="text-xs text-muted-foreground/60 truncate">
                            {formatDistanceToNow(new Date(room.createdAt), { addSuffix: true })}
                          </time>
                        </div>
                      </div>
                      <div className="shrink-0 rounded-md border bg-muted/30 w-16 h-16 flex items-center justify-center">
                        <Users className="text-muted-foreground/50 h-6 w-6" />
                      </div>
                    </div>
                  </Link>
                ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
