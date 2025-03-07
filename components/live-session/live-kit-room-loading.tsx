export function LiveKitRoomLoading() {
  return (
    <div className="flex items-center justify-center h-[600px] bg-muted">
      <div className="text-center space-y-4">
        <div className="text-lg">Connecting to session...</div>
        <div className="text-sm text-muted-foreground">This may take a few moments</div>
      </div>
    </div>
  )
}
