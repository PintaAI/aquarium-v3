"use client"

import { useEffect, useState } from "react"
interface LiveKitRoom {
  name: string
  numParticipants: number
  creationTime: number
}
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users } from "lucide-react"

export function LiveSessionList() {
  const [sessions, setSessions] = useState<LiveKitRoom[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await fetch('/api/room/sessions')
        const data = await response.json()
        setSessions(data.rooms)
      } catch (error) {
        console.error("Failed to fetch sessions:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSessions()
    // Poll for updates every 5 seconds
    const interval = setInterval(fetchSessions, 5000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return <div>Loading sessions...</div>
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Live Sessions</h2>
      <div className="grid gap-4">
        {sessions.map((session) => (
          <Card key={session.name}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{session.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Created {new Date(session.creationTime * 1000).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <Badge variant="secondary">
                    {session.numParticipants} participants
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {sessions.length === 0 && (
          <p className="text-muted-foreground text-center py-4">
            No active sessions
          </p>
        )}
      </div>
    </div>
  )
}
