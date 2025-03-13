"use client"
import Link from "next/link"
import {  Newspaper, BookOpen, Video, Book, PenTool } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

const tools = [
  {
    id: "dashboard",
    title: "whiteboard",
    description: "mulai sesi mengajar",
    icon: PenTool,
    route: "/dashboard/teach",
  },
  {
    id: "live-session",
    title: "Live Session",
    description: "Mulai sesi mengajar",
    icon: Video,
    route: "/dashboard/live-session",
  },
  {
    id: "create-course",
    title: "Buat Materi",
    description: "Tambah materi baru",
    icon: BookOpen,
    route: "/courses/create-course",
  },
  {
    id: "create-article",
    title: "Tulis Artikel",
    description: "Buat artikel baru",
    icon: Newspaper, 
    route: "/artikel/create",
  },
  {
    id: "vocabulary",
    title: "Kosa Kata",
    description: "Tambah kosa kata",
    icon: Book,
    route: "/vocabulary/create",
  },
]

interface GuruToolsProps {
  role?: string
}

export function GuruTools({ role }: GuruToolsProps) {
  if (role !== "GURU") return null

  return (
    <div className="mb-4 shadow-md shadow-emerald-900 rounded-lg pt-2 p-1">
      <div className="grid grid-cols-5 gap-2">
        {tools.map((tool) => (
          <Tooltip key={tool.id}>
            <TooltipTrigger asChild>
              <Link
                href={tool.route}
                className="flex flex-col items-center py-2 px-1 rounded transition-all duration-200 hover:bg-primary/10 hover:scale-105 hover:shadow-sm hover:text-primary group"
              >
                <tool.icon className="h-4 w-4 mb-1 text-muted-foreground group-hover:text-primary group-hover:-translate-y-2 transition-all duration-200" />
                <span className="hidden sm:block text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors duration-200">{tool.title}</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              {tool.description}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </div>
  )
}
