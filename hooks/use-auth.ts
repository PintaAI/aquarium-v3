"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

type UseAuthOptions = {
  /** Redirect to this URL if user is not authenticated */
  required?: boolean
  /** URL to redirect to if user is not authenticated */
  redirectTo?: string
  /** Called when session changes */
  onSessionChange?: (session: any) => void
}

/**
 * Hook to handle auth state in client components
 */
export function useAuth(options: UseAuthOptions = {}) {
  const { required = false, redirectTo = "/auth/login", onSessionChange } = options
  const { data: session, status, update } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (required && status === "unauthenticated") {
      router.push(redirectTo)
    }

    if (onSessionChange) {
      onSessionChange(session)
    }
  }, [required, redirectTo, router, session, status, onSessionChange])

  return {
    session,
    status,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    /** Update the session data */
    updateSession: update,
  }
}
