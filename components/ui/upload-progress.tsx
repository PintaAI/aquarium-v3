import React from 'react'
import { Progress } from './progress'

interface UploadProgressProps {
  progress: number
  isUploading: boolean
  fileName?: string
  fileSize?: string
}

export const UploadProgress: React.FC<UploadProgressProps> = ({
  progress,
  isUploading,
  fileName,
  fileSize
}) => {
  if (!isUploading && progress === 0) return null

  return (
    <div className="space-y-2 p-3 bg-muted/50 rounded-lg border">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium truncate">
          {fileName || 'Uploading file...'}
        </span>
        <span className="text-muted-foreground ml-2">
          {fileSize && `${fileSize} • `}{progress}%
        </span>
      </div>
      
      <Progress value={progress} className="h-2" />
      
      {isUploading && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="animate-spin rounded-full h-3 w-3 border border-primary border-t-transparent" />
          <span>
            {progress < 100 ? 'Uploading...' : 'Processing...'}
          </span>
        </div>
      )}
    </div>
  )
}