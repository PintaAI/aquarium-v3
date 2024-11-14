import { ReactNode } from "react";
import { GraduationCap } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

export default function EpsTopikLayout({ children }: LayoutProps) {
  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-primary/10 rounded-full">
            <GraduationCap className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">EPS-TOPIK Practice</h1>
        </div>
        
        <nav className="flex gap-4 mb-6">
          <a href="/game/eps-topik" className="text-primary hover:underline">
            Overview
          </a>
          <a href="/game/eps-topik/reading" className="text-primary hover:underline">
            Reading Test
          </a>
          <a href="/game/eps-topik/listening" className="text-primary hover:underline">
            Listening Test
          </a>
          <a href="/game/eps-topik/mock-exam" className="text-primary hover:underline">
            Mock Exam
          </a>
          <a href="/game/eps-topik/progress" className="text-primary hover:underline">
            Progress
          </a>
        </nav>

        <main className="bg-white rounded-lg shadow">
          {children}
        </main>
      </div>
    </div>
  );
}
