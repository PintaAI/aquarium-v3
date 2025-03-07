import { Button } from "@/components/ui/button"

interface LiveKitRoomErrorProps {
  error: string
}

export function LiveKitRoomError({ error }: LiveKitRoomErrorProps) {
  return (
    <div className="flex items-center justify-center h-[600px] bg-muted">
      <div className="text-center space-y-4">
        <div className="text-lg text-destructive">{error}</div>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
        >
          Try Again
        </Button>
      </div>
    </div>
  )
}
