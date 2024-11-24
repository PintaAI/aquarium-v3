import { ReactNode } from "react";
import { Mic } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

export default function PronounceLayout({ children }: LayoutProps) {
  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-primary/10 rounded-full">
            <Mic className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Pronunciation Master</h1>
        </div>
        
        <nav className="flex gap-4 mb-6">
          <a href="/game/pronounce" className="text-primary hover:underline">
            Overview
          </a>
          <a href="/game/pronounce/basic" className="text-primary hover:underline">
            Basic Sounds
          </a>
          <a href="/game/pronounce/words" className="text-primary hover:underline">
            Word Practice
          </a>
          <a href="/game/pronounce/sentences" className="text-primary hover:underline">
            Sentence Practice
          </a>
          <a href="/game/pronounce/records" className="text-primary hover:underline">
            My Records
          </a>
        </nav>

        <main className=" rounded-lg shadow">
          {children}
        </main>
      </div>
    </div>
  );
}
