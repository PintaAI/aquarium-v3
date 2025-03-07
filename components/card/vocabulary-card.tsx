import * as React from "react"
import { Card, CardContent, CardDescription, CardTitle } from "../ui/card"
import { Progress } from "../ui/progress"
import { User } from "@prisma/client"
import { UserIcon, LockIcon, UnlockIcon } from "lucide-react"

interface VocabularyItem {
  isChecked: boolean
}

interface VocabularyCardProps {
  title: string
  description?: string | null
  user?: Pick<User, "name"> | null
  items: VocabularyItem[]
  isPublic?: boolean
}

export function VocabularyCard({
  title,
  description,
  user,
  items,
  isPublic = false
}: VocabularyCardProps) {
  const totalItems = items.length
  const checkedItems = items.filter(item => item.isChecked).length
  const progress = totalItems > 0 ? (checkedItems / totalItems) * 100 : 0

  return (
    <Card className="group relative bg-card overflow-hidden rounded-lg border border-border transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/50 hover:-translate-y-1">
      <div className="relative h-32 w-full overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-primary/20 to-emerald-500/20">
            {/* Decorative Orbs */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/20 rounded-full blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-emerald-500/20 rounded-full blur-2xl" />
          </div>
          {/* Progress Bar */}
          <div className="absolute bottom-0 inset-x-0">
            <div className="space-y-1 px-4 py-2 bg-background/50 backdrop-blur-sm">
              <div className="flex items-center gap-1.5">
                <UserIcon className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-foreground">
                  {user?.name || 'Anonymous'}
                </span>
              </div>
              <div className="space-y-1">
                <Progress value={progress} className="h-1.5" />
                <div className="flex justify-between text-[10px] text-foreground">
                  <span>{checkedItems} completed</span>
                  <span>{totalItems} kata</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Top Row: Word Count and Privacy */}
        <div className="absolute top-2 inset-x-2 flex justify-between items-center">
          <div className="px-2.5 py-1 rounded-full bg-primary/20 backdrop-blur-sm">
            <span className="text-xs font-medium text-primary-foreground">
              {totalItems} kata
            </span>
          </div>
          <div className="p-1.5 rounded-full bg-background/50 backdrop-blur-sm">
            {isPublic ? (
              <UnlockIcon className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <LockIcon className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </div>
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
