import { useState, useEffect } from "react"
import { toast } from "sonner"

interface TokenResponse {
  token: string
}

export function useLiveKitToken(roomId: string, userName: string) {
  const [token, setToken] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const getToken = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const resp = await fetch(
          `/api/token?room=${roomId}&username=${userName}`
        )
        
        if (!resp.ok) {
          const data = await resp.json()
          throw new Error(data.error || "Failed to get access token")
        }
        
        const data = await resp.json() as TokenResponse
        
        if (typeof data.token === 'string') {
          setToken(data.token)
        } else {
          console.error("[LiveKit] Token is not a string:", typeof data.token)
          throw new Error("Invalid token format received")
        }
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "Failed to join session"
        setError(errorMessage)
        toast.error(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    getToken()
  }, [roomId, userName])

  return { token, error, isLoading }
}
