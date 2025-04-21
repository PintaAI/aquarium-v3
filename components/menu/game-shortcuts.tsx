"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { games } from "@/data/games"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

export function GameShortcuts() {
  return (
    <Card className="border-none bg-gradient-to-b from-accent/20 to-background/60 dark:from-accent/10 dark:to-background backdrop-blur-md shadow-[0_8px_32px_rgb(0,0,0,0.04)]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between px-2">
          <CardTitle className="text-lg font-semibold">App</CardTitle>
          <Link
            href="/game"
            className="text-sm font-medium text-accent hover:text-primary transition-colors flex items-center"
          >
            Selengkapnya
            <ChevronRight className="h-4 w-4 ml-0.5" />
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {games.map((game) => (
            <div
              key={game.id}
            >
              <Link
                href={game.route}
                className="flex flex-col items-center p-3 rounded-2xl cursor-pointer hover:bg-accent/5 active:bg-accent/10 transition-all duration-150 group"
              >
                <div className="mb-2.5 p-3.5 rounded-2xl bg-gradient-to-b from-background to-muted/10 dark:from-background dark:to-accent/5 shadow-[0_2px_8px_rgb(0,0,0,0.02)] group-hover:shadow-[0_4px_16px_rgb(0,0,0,0.04)] group-hover:translate-y-[-1px] transition-all">
                  <game.icon className="h-6 w-6 text-primary" />
                </div>
                <span className="text-[13px] text-center font-medium text-muted-foreground group-hover:text-foreground transition-colors">
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
