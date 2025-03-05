import * as React from "react"
import { Card, CardHeader, CardTitle, CardDescription } from "../ui/card"

interface ModuleCardProps {
  title: string
  description: string
}

export function ModuleCard({
  title,
  description,
}: ModuleCardProps) {
  return (
    <Card className="w-full hover:bg-accent/5 transition-colors">
      <CardHeader>
        <CardTitle className="font-semibold">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  )
}
