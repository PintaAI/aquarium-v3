"use client";
import { ReactNode, useState } from "react";
import { Languages, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
}

export default function HangeulLayout({ children }: LayoutProps) {
  const [open, setOpen] = useState(false);
  
  const navigationItems = [
    { href: "/game/hangeul", label: "Overview" },
    { href: "/game/hangeul/Leaderboard", label: "Leaderboard" },
  ];

  const NavLink = ({ href, label }: { href: string; label: string }) => (
    <a
      href={href}
      className={cn(
        "text-sm font-medium transition-colors",
        "block select-none rounded-md px-3 py-2 no-underline",
        "hover:bg-primary/10 hover:text-primary",
        "focus:outline-none focus:ring-2 focus:ring-primary"
      )}
      onClick={() => setOpen(false)}
    >
      {label}
    </a>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4 md:px-6 md:py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="p-2 md:p-3 bg-primary/10 rounded-full">
                <Languages className="w-6 h-6 md:w-8 md:h-8 text-primary" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                Belajar Hangeul
              </h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-2" aria-label="Main Navigation">
            {navigationItems.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
          </nav>

          {/* Main Content */}
              {children}
           
        </div>
      </div>
    </div>
  );
}