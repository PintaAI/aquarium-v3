"use client"

import Link from 'next/link';
import { ThemeToggle } from "./theme-toggle"

export default function Navbar() {
  return (
    <nav className="border-b bg-background">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <ul className="flex items-center space-x-4">
            <li>
              <Link href="/" className="text-foreground hover:text-foreground/80">Home</Link>
            </li>
            <li>
              <Link href="/courses" className="text-foreground hover:text-foreground/80">Courses</Link>
            </li>
            <li>
              <Link href="/game" className="text-foreground hover:text-foreground/80">Games</Link>
            </li>
            <li>
              <Link href="/profil" className="text-foreground hover:text-foreground/80">Profile</Link>
            </li>
            <li>
              <Link href="/artikel" className="text-foreground hover:text-foreground/80">Articles</Link>
            </li>
          </ul>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
