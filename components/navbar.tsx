"use client";

import Link from 'next/link';
import { ThemeToggle } from "./theme-toggle";
import { useSession } from "next-auth/react";
import { Button } from "./ui/button";
import { UserCircle, LogOut } from "lucide-react";
import Image from "next/image";
import { SignOutButton } from "./auth/sign-out-button";
import { ProfileButton } from "./auth/profile-button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Separator } from "./ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import AuthCard from "./form/AuthCard";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:block fixed top-0 z-50 w-full h-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="max-w-screen-xl mx-auto px-4 flex h-full items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/images/logo-text.png"
                alt="Logo"
                width={120}
                height={32}
                className="h-8 w-auto"
              />
            </Link>
          </div>

          <div className="flex items-center space-x-8">
            <Link
              href="/courses"
              className="text-foreground/60 hover:text-foreground transition-colors"
            >
              Courses
            </Link>
            <Link
              href="/game"
              className="text-foreground/60 hover:text-foreground transition-colors"
            >
              Games
            </Link>
            <Link
              href="/artikel"
              className="text-foreground/60 hover:text-foreground transition-colors"
            >
              Articles
            </Link>

            <Separator orientation="vertical" className="h-6" />

            <div className="flex items-center space-x-4">
              <ThemeToggle />
              {session ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar>
                        <AvatarImage src={session.user?.image || undefined} />
                        <AvatarFallback>
                          {session.user?.name?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48" align="end">
                    <div className="flex flex-col py-1">
                      <ProfileButton
                        variant="ghost"
                        className="flex items-center w-full justify-start text-sm px-3 py-1.5 hover:bg-accent hover:text-accent-foreground transition-colors"
                        icon={<UserCircle className="mr-2 h-4 w-4" />}
                      />
                      <SignOutButton
                        variant="ghost"
                        className="flex items-center w-full justify-start text-sm px-3 py-1.5 hover:bg-destructive hover:text-destructive-foreground transition-colors"
                        icon={<LogOut className="mr-2 h-4 w-4" />}
                      />
                    </div>
                  </PopoverContent>
                </Popover>
              ) : (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">Sign in</Button>
                  </PopoverTrigger>
                  <PopoverContent align="end">
                    <AuthCard mode="login" />
                  </PopoverContent>
                </Popover>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
    
    </>
  );
}
