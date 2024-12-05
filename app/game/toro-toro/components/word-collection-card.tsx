"use client"

import { Book, CheckCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface WordCollectionCardProps {
  title: string
  itemCount: number
  previewWord?: {
    term: string
    definition: string
  }
  description?: string
  isSelected?: boolean
  isPublic?: boolean
  user?: {
    name: string | null
    role: string
  } | null
  onClick: () => void
}

export function WordCollectionCard({
  title,
  itemCount,
  previewWord,
  description,
  isSelected,
  isPublic = false,
  user,
  onClick
}: WordCollectionCardProps) {
  const getBadgeContent = () => {
    if (!isPublic) return "kosa kata mu"
    if (user?.role === "GURU") return "Publik"
    if (!user?.name) return "Publik Sistem"
    return "Publik"
  }

  const getBadgeVariant = () => {
    if (!isPublic) return "default"
    if (user?.role === "GURU") return "secondary"
    if (!user?.name) return "secondary"
    return "outline"
  }

  return (
    <div
      onClick={onClick}
      className={`
        group relative overflow-hidden rounded-lg transition-all duration-300 
        hover:shadow-md cursor-pointer border
        ${isSelected 
          ? 'border-primary bg-primary/5' 
          : 'border-border hover:border-primary/50 bg-card'
        }
      `}
    >
      <div className="relative p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                {title}
              </h3>
              <Badge 
                variant={getBadgeVariant()} 
                className="text-[10px] px-2 py-0 h-4"
              >
                {getBadgeContent()}
              </Badge>
            </div>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <Book className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {itemCount} Kata
              </span>
              {user?.name && (
                <>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">
                    oleh {user.name}
                  </span>
                </>
              )}
            </div>
          </div>
          
          {isSelected && (
            <CheckCircle className="h-5 w-5 text-primary shrink-0" />
          )}
        </div>

        {/* Preview */}
        {previewWord && (
          <div className="mt-3 p-2.5 rounded-md bg-muted/50 group-hover:bg-primary/5 transition-colors">
            <div className="flex gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {previewWord.term}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {previewWord.definition}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Description */}
        {description && (
          <p className="mt-2 text-xs text-muted-foreground line-clamp-1">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
