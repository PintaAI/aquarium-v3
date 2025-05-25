
import AuthCard from "@/components/auth/auth-card"
import { Suspense } from "react"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Suspense fallback={<div>Loading...</div>}>
        <AuthCard />
      </Suspense>
    </div>
  )
}
