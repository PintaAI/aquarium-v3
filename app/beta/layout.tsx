import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"

export default function BetaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen flex flex-col">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Alert className="mx-4 md:mx-auto md:max-w-7xl bg-yellow-50/50 border-yellow-200">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="text-sm">Beta Features</AlertTitle>
          <AlertDescription className="text-xs">
            These features are in development and may change.
          </AlertDescription>
        </Alert>
      </div>
      <div >
        {children}
      </div>
    </div>
  )
}
