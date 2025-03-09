"use client"

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from "next-auth/react";
import { Home, BookOpen, BookText, User } from "lucide-react";
import { RiApps2AiFill } from "react-icons/ri";



import { Avatar, AvatarFallback, AvatarImage } from './avatar';

import { Popover, PopoverContent, PopoverTrigger } from './popover';
import AuthCard from '../auth/auth-card';

export function MobileNavbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (pathname === '/game/toro-toro') {
    return null;
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background z-50">
      <div className="grid grid-cols-5 gap-1 p-2">
        <Link 
          href="/" 
          className={`flex flex-col items-center justify-center p-2 hover:text-foreground ${
            pathname === "/" || pathname === "" ? "text-foreground" : "text-foreground/60"
          }`}
        >
          <Home className="h-6 w-6" />
        </Link>
        <Link 
          href="/courses" 
          className={`flex flex-col items-center justify-center p-2 hover:text-foreground ${
            pathname.startsWith("/courses") ? "text-foreground" : "text-foreground/60"
          }`}
        >
          <BookOpen className="h-6 w-6" />
        </Link>
        <Link 
          href="/game" 
          className={`flex flex-col items-center justify-center p-2 hover:text-foreground ${
            pathname.startsWith("/game") ? "text-foreground" : "text-foreground/60"
          }`}
        >
          <RiApps2AiFill className="h-8 w-8" />
        </Link>
        <Link 
          href="/vocabulary" 
          className={`flex flex-col items-center justify-center p-2 hover:text-foreground ${
            pathname.startsWith("/vocabulary") ? "text-foreground" : "text-foreground/60"
          }`}
        >
          <BookText className="h-6 w-6" />
        </Link>
        {session ? (
          <Link 
            href="/profil" 
            className={`flex flex-col items-center justify-center p-2 hover:text-foreground ${
              pathname.startsWith("/profil") ? "text-foreground" : "text-foreground/60"
            }`}
          >
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
              <AuthCard />
            </PopoverContent>
          </Popover>
        )}
      </div>
      <div className="pb-7"></div>
    </nav>
  );
}
