import Link from 'next/link';
import { Card, CardContent } from "@/components/ui/card";
import { Game } from "@/data/games";

interface GameCardProps {
  game: Game;
}

export function GameCard({ game }: GameCardProps) {
  const Icon = game.icon;


  return (
    <Link href={game.route}>
      <Card className="group relative bg-card overflow-hidden rounded-lg border border-border transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/50 hover:-translate-y-1">
        <div className="relative h-32 w-full overflow-hidden">
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-primary/20 to-emerald-500/20">
            {/* Decorative Orbs */}
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-primary/20 rounded-full blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-14 h-14 bg-emerald-500/20 rounded-full blur-2xl" />
          </div>

          {/* Icon Container */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="p-3 rounded-full bg-background/50 backdrop-blur-sm group-hover:bg-primary/20 transition-colors duration-200">
              <Icon className="w-8 h-8 text-primary group-hover:text-primary-foreground transition-colors duration-200" />
            </div>
          </div>
        </div>

        <CardContent className="p-4">
          <div>
            <h3 className="text-lg font-bold mb-1.5 line-clamp-1 group-hover:text-primary transition-colors">
              {game.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {game.description}
            </p>
          </div>
          <div className="mt-2">
            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
              {game.type}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
