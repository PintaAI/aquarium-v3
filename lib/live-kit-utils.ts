import { toast } from "sonner"
import { deleteLiveSession, getLiveSessionWithAccess } from "@/app/actions/live-session-actions"

const MAX_RETRIES = 2
const RETRY_DELAY = 1000 // 1 second

export async function handleCreatorDisconnection(roomId: string, userId: string) {
  try {
    const session = await getLiveSessionWithAccess(roomId)
    
    if (session.creator.id === userId) {
      let success = false
      
      // Try to delete session with retries
      for (let i = 0; i < MAX_RETRIES && !success; i++) {
        try {
          await deleteLiveSession(roomId)
          success = true
          toast.success("Live session ended and all participants disconnected")
        } catch (error) {
          console.error(`Failed to delete session (attempt ${i + 1}):`, error)
          if (i < MAX_RETRIES - 1) {
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
          }
        }
      }
      
      if (!success) {
        toast.error("Failed to end session properly")
      }
    }
  } catch (error) {
    console.error("Failed to handle disconnection:", error)
  }
}
