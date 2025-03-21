"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { games } from "@/data/games"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

export function GameShortcuts() {
  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">App</CardTitle>
          <Link
            href="/game"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center"
          >
            View all
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {games.map((game) => (
            <div
              key={game.id}
            >
              <Link
                href={game.route}
                className="flex flex-col items-center p-3 rounded-lg cursor-pointer hover:bg-accent/50 transition-all duration-300 group"
              >
                <div className="mb-3 p-2 rounded-full group-hover:bg-primary/20 transition-colors bg-accent/50">
                  <game.icon className="h-6 w-6 text-primary " />
                </div>
                <span className="text-sm text-center font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  {game.title}
                </span>
              </Link>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
