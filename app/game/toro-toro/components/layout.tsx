import { ReactNode } from "react";
import { BookOpen } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

export default function ToroToroLayout({ children }: LayoutProps) {
  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-primary/10 rounded-full">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Toro-Toro</h1>
        </div>
        
        <nav className="flex gap-4 mb-6">
          <a href="/game/toro-toro" className="text-primary hover:underline">
            Overview
          </a>
          <a href="/game/toro-toro/play" className="text-primary hover:underline">
            Play Game
          </a>
          <a href="/game/toro-toro/leaderboard" className="text-primary hover:underline">
            Leaderboard
          </a>
          <a href="/game/toro-toro/categories" className="text-primary hover:underline">
            Categories
          </a>
        </nav>

        <main className="bg-white rounded-lg shadow">
          {children}
        </main>
      </div>
    </div>
  );
}
