"use client"

import Link from 'next/link';
import { useSession } from "next-auth/react";
import { Home, BookOpen, GamepadIcon, NewspaperIcon, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import AuthCard from "./form/AuthCard";

export function MobileNavbar() {
  const { data: session } = useSession();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background z-50">
      <div className="grid grid-cols-5 gap-1 p-2">
        <Link href="/" className="flex flex-col items-center justify-center p-2 text-foreground/60 hover:text-foreground">
          <Home className="h-6 w-6" />
        </Link>
        <Link href="/courses" className="flex flex-col items-center justify-center p-2 text-foreground/60 hover:text-foreground">
          <BookOpen className="h-6 w-6" />
        </Link>
        <Link href="/game" className="flex flex-col items-center justify-center p-2 text-foreground/60 hover:text-foreground">
          <GamepadIcon className="h-6 w-6" />
        </Link>
        <Link href="/artikel" className="flex flex-col items-center justify-center p-2 text-foreground/60 hover:text-foreground">
          <NewspaperIcon className="h-6 w-6" />
        </Link>
        {session ? (
          <Link href="/profil" className="flex flex-col items-center justify-center p-2 text-foreground/60 hover:text-foreground">
            <Avatar className="h-6 w-6">
              <AvatarImage src={session.user?.image || undefined} />
              <AvatarFallback className="text-xs">
                {session.user?.name?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
          </Link>
        ) : (
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex flex-col items-center justify-center p-2 text-foreground/60 hover:text-foreground">
                <User className="h-6 w-6" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="start">
              <AuthCard mode="login" />
            </PopoverContent>
          </Popover>
        )}
      </div>
      <div className="pb-7"></div>
    </nav>
  );
}
