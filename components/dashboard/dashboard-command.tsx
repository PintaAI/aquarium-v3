"use client"

import * as React from "react"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { DialogTitle } from "@/components/ui/dialog"
import { useRouter } from "next/navigation"

export function DashboardCommand() {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()

  const toggleOpen = () => setOpen((prev) => !prev)

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={toggleOpen}
          className="sm:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border bg-muted"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="h-4 w-4"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </button>
        <div className="hidden sm:flex items-center">
          <p className="text-sm text-muted-foreground mr-2">Press</p>
          <kbd className="pointer-events-none h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium opacity-100 flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>
      </div>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <DialogTitle className="sr-only">Search commands</DialogTitle>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => router.push("/game")}>
              Games
            </CommandItem>
            <CommandItem onSelect={() => router.push("/vocabulary")}>
              Vocabulary
            </CommandItem>
            <CommandItem onSelect={() => router.push("/courses")}>
              Courses
            </CommandItem>
            <CommandItem onSelect={() => router.push("/artikel")}>
              Articles
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Profile">
            <CommandItem onSelect={() => router.push("/profil")}>
              Settings
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
