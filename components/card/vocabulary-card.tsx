import * as React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card"
import { User } from "@prisma/client"

interface VocabularyCardProps {
  title: string
  description?: string | null
  user?: Pick<User, "name"> | null
  totalItems: number
  checkedItems: number
}

export function VocabularyCard({
  title,
  description,
  user,
  totalItems,
  checkedItems,
}: VocabularyCardProps) {
  const progress = totalItems > 0 ? (checkedItems / totalItems) * 100 : 0

  return (
    <Card className="w-full hover:bg-accent/5 transition-colors">
      <CardHeader>
        <CardTitle className="font-semibold">{title}</CardTitle>
        {user?.name && (
          <p className="text-sm text-muted-foreground">Created by {user.name}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>{checkedItems} completed</span>
              <span>{totalItems} words</span>
            </div>
            <div className="h-2 rounded-full bg-muted">
              <div 
                className="h-full rounded-full bg-primary transition-all" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
