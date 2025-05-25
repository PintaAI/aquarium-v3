import { games } from "@/data/games"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

export default function GamesPage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-6 sm:py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {games.map((game) => {
          const Icon = game.icon
          return (
            <Link key={game.id} href={game.route}>
              <Card className="group relative bg-card overflow-hidden rounded-lg border border-border transition-all duration-200 hover:shadow-lg hover:shadow-primary/50 hover:-translate-y-1">
                <div className="relative h-32 w-full overflow-hidden">
                  {/* Gradient Background */}
                  <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-primary/20">
                      {/* Decorative Elements */}
                      <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/20 rounded-full blur-2xl" />
                      <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-primary/20 rounded-full blur-2xl" />
                      {/* Icon */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Icon className="h-12 w-12 text-primary/40 group-hover:text-primary/60 transition-colors -translate-y-2" />
                      </div>
                    </div>
                  </div>
                </div>

                <CardContent className="p-4">
                  <h3 className="text-lg font-bold mb-1.5 line-clamp-1 group-hover:text-primary transition-colors">
                    {game.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {game.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
