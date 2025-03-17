import * as React from "react"
import { Card, CardContent, CardDescription, CardTitle } from "../ui/card"
import { Difficulty, User } from "@prisma/client"
import { UserIcon, Pencil, Trash2 } from "lucide-react"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { UseCurrentUser } from "@/hooks/use-current-user"

interface SoalItem {
  id: number
  difficulty: Difficulty | null
}

interface SoalCardProps {
  id: number
  title: string
  description?: string | null
  user?: Pick<User, "name" | "id"> | null
  soals: SoalItem[]
  onClick?: () => void
  onEdit?: () => void
  onDelete?: () => void
}

// id is used indirectly through onClick prop when passed to parent components
export function SoalCard({
  id, // eslint-disable-line @typescript-eslint/no-unused-vars
  title,
  description,
  user,
  soals,
  onClick,
  onEdit,
  onDelete
}: SoalCardProps) {
  const currentUser = UseCurrentUser()
  const isAuthor = currentUser?.id === user?.id
  const isGuru = currentUser?.role === "GURU"
  const canManage = isGuru || isAuthor
  const totalSoals = soals.length
  const difficultyCount = {
    BEGINNER: soals.filter(s => s.difficulty === "BEGINNER").length,
    INTERMEDIATE: soals.filter(s => s.difficulty === "INTERMEDIATE").length,
    ADVANCED: soals.filter(s => s.difficulty === "ADVANCED").length,
  }
  const mostFrequentDifficulty = totalSoals > 0
    ? Object.entries(difficultyCount)
        .reduce((a, b) => a[1] > b[1] ? a : b)[0] as Difficulty
    : null

  const difficultyColors = {
    BEGINNER: "text-emerald-500",
    INTERMEDIATE: "text-yellow-500",
    ADVANCED: "text-red-500",
  }

  const difficultyLabels = {
    BEGINNER: "Mudah",
    INTERMEDIATE: "Menengah",
    ADVANCED: "Sulit"
  }

  return (
    <Card 
      className="group relative bg-card overflow-hidden rounded-lg border border-border transition-all duration-200 hover:shadow-lg hover:shadow-primary/50 hover:-translate-y-1 cursor-pointer"
      onClick={onClick}
    >
      <div className="relative h-28 w-full overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-primary/20">
            {/* Decorative Orbs */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/20 rounded-full blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-primary/20 rounded-full blur-2xl" />
          </div>
          {/* Info Bar */}
          <div className="absolute bottom-0 inset-x-0">
            <div className="flex justify-between items-center px-4 py-2 bg-background/50 backdrop-blur-sm">
              <div className="flex items-center gap-1.5">
                <UserIcon className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-foreground">
                  {user?.name || 'Anonymous'}
                </span>
              </div>
              {mostFrequentDifficulty && (
                <Badge 
                  variant="outline" 
                  className={`${difficultyColors[mostFrequentDifficulty]} border-current`}
                >
                  {difficultyLabels[mostFrequentDifficulty]}
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        {/* Top Row: Question Count and Author Actions */}
        <div className="absolute top-2 inset-x-2 flex justify-between items-center">
          <div className="px-2.5 py-1 rounded-full bg-primary/20 backdrop-blur-sm">
            <span className="text-xs font-medium text-primary-foreground">
              {totalSoals} soal
            </span>
          </div>
          {canManage && (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 bg-background/50 backdrop-blur-sm hover:bg-background/80 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit?.()
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 bg-background/50 backdrop-blur-sm hover:bg-background/80 hover:text-red-500 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete?.()
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <CardContent className="p-4">
        <div>
          <CardTitle className="text-lg font-bold mb-1.5 line-clamp-1 group-hover:text-primary transition-colors">
            {title}
          </CardTitle>
          {description && (
            <CardDescription className="text-sm text-muted-foreground line-clamp-2">
              {description}
            </CardDescription>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
