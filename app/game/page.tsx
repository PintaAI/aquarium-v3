import { games } from "@/data/games"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SpotlightCard } from "@/components/ui/spotlight-card"
import Link from "next/link"

export default function GamesPage() {
  return (
    <div className="container mx-auto max-w-7xl p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {games.map((game) => {
          const Icon = game.icon
          return (
            <Link key={game.id} href={game.route}>
              <SpotlightCard className="w-full bg-card border rounded-lg group hover:bg-accent/5 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon className="w-5 h-5" />
                    <span>{game.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground group-hover:text-accent-foreground">
                    {game.description}
                  </p>
                </CardContent>
              </SpotlightCard>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
