import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { games } from "@/data/games";
import Link from "next/link";

export function GameShortcuts() {
  return (
    <Card className="border-none">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-md">App</CardTitle>
          <Link
            href="/game"
            className="text-xs font-medium hover:underline"
          >
            lihat lebih
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3">
          {games.map((game) => (
            <Link
              key={game.id}
              href={game.route}
              className="flex flex-col items-center p-3 border rounded-lg cursor-pointer hover:bg-accent transition-colors"
            >
              <div className="mb-2">
                <game.icon className="h-6 w-6" />
              </div>
              <span className="text-xs text-center font-medium">{game.title}</span>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
