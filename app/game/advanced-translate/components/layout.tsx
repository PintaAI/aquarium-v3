import { ReactNode } from "react";
import { BookText } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

export default function AdvancedTranslateLayout({ children }: LayoutProps) {
  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-primary/10 rounded-full">
            <BookText className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Advanced Translate</h1>
        </div>
        
        <nav className="flex gap-4 mb-6">
          <a href="/game/advanced-translate" className="text-primary hover:underline">
            Overview
          </a>
          <a href="/game/advanced-translate/daily" className="text-primary hover:underline">
            Daily Practice
          </a>
          <a href="/game/advanced-translate/grammar" className="text-primary hover:underline">
            Grammar Focus
          </a>
          <a href="/game/advanced-translate/context" className="text-primary hover:underline">
            Cultural Context
          </a>
          <a href="/game/advanced-translate/history" className="text-primary hover:underline">
            History
          </a>
        </nav>

        <main className="bg-white rounded-lg shadow">
          {children}
        </main>
      </div>
    </div>
  );
}
