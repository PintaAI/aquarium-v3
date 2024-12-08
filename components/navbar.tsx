"use client";

import Link from 'next/link';
import { Book, GamepadIcon, Newspaper, BookOpen, LogOut, UserCircle } from "lucide-react";
import Image from "next/image";
import { ThemeToggle } from "./theme-toggle";
import { Separator } from "./ui/separator";
import { usePathname } from "next/navigation";
import { UseCurrentUser } from "@/hooks/use-current-user";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { signOut } from "next-auth/react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import AuthCard from "./form/AuthCard";

const data = {
  navMain: [
    {
      title: "Kursus",
      url: "/courses",
      icon: Book,
      isActive: false,
    },
    {
      title: "Game",
      url: "/game",
      icon: GamepadIcon,
      isActive: false,
    },
    {
      title: "Artikel",
      url: "/artikel",
      icon: Newspaper,
      isActive: false,
    },
    {
      title: "Kosa-kata",
      url: "/vocabulary",
      icon: BookOpen,
      isActive: false,
    },
  ],
}

export default function Navbar() {
  const pathname = usePathname();
  const user = UseCurrentUser();

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:block fixed top-0 z-50 w-full h-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="max-w-screen-xl mx-auto px-4 flex h-full items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex aspect-square size-12 items-center justify-center">
                <Image 
                  src="/images/logoo.png"
                  alt="Pejuangkorea Logo"
                  width={60}
                  height={60}
                  className="size-full"
                />
              </div>
              <div className="grid flex-1 text-left text-m leading-tight">
                <span className="truncate font-semibold">Pejuangkorea Academy</span>
                <span className="truncate text-xs text-muted-foreground">Platform Belajar Bahasa Korea</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center space-x-8">
            {data.navMain.map((item) => (
              <Link
                key={item.title}
                href={item.url}
                className={`flex items-center gap-2 text-sm ${
                  pathname.startsWith(item.url)
                    ? "text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                } transition-colors`}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            ))}

            <Separator orientation="vertical" className="h-6" />

            <div className="flex items-center space-x-4">
              <ThemeToggle />
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.image || ""} alt={user.name || ""} />
                        <AvatarFallback>
                          {user.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem asChild>
                        <Link href="/profil" className="w-full">
                          <UserCircle className="mr-2 h-4 w-4" />
                          <span>Profile</span>
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    {user.role === "ADMIN" && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                          <DropdownMenuItem asChild>
                            <Link href="/dashboard/control-panel-x8472" className="w-full">
                              Panel Admin
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut()}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
