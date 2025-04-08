'use client'

interface VideoComponentProps {
  streamCallId: string | null
  isCreator: boolean
}

export function VideoComponent({ streamCallId, isCreator }: VideoComponentProps) {
  return (
    <div className="w-full aspect-video bg-muted rounded-sm mt-0 md:mt-6">
      {streamCallId ? (
        <div className="w-full h-full flex items-center justify-center">
          {/* TODO: Add Stream SDK implementation */}
          <p className="text-muted-foreground">
            {isCreator ? 'Setting up your stream...' : 'Connecting to stream...'}
          </p>
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <p className="text-muted-foreground">
            {isCreator 
              ? 'Waiting for you to start the session'
              : 'Waiting for host to start the session'
            }
          </p>
        </div>
      )}
    </div>
  )
}
