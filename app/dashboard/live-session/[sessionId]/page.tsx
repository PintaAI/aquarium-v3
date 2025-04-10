import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getLiveSession } from '@/app/actions/live-session-actions'
// Import the new wrapper component
import { LiveSessionWrapper } from '@/components/live-session/live-session-wrapper'
// ChatComponent is now rendered inside the wrapper, so we don't need it here directly

// This remains a Server Component for initial data fetching
// Define props inline to potentially avoid type inference issues during build
export default async function LiveSessionPage({ params }: { params: { sessionId: string } }) {
  // Params are passed directly in the App Router
  const { sessionId } = params; // Correctly access sessionId without await

  const session = await auth()
  if (!session?.user) {
    redirect('/auth/login')
  }

  const liveSession = await getLiveSession(sessionId) // Use awaited sessionId
  if (!liveSession) {
    // Redirect if session data couldn't be fetched (e.g., invalid ID)
    redirect('/dashboard/live-session?error=session_not_found')
  }

  // Determine if the current user is the creator
  const isCreator = liveSession.creator.id === session.user.id

  // Render the client wrapper component, passing down the fetched data
  return (
    <LiveSessionWrapper
      liveSessionData={liveSession}
      isCreator={isCreator}
    />
  )
}
