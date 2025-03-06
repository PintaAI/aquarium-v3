"use client"

import Link from "next/link"
import { getJoinedCourses } from "@/app/actions/course-actions"
import { useEffect, useState } from "react"
import Image from "next/image"
import { BookOpen, GraduationCap } from "lucide-react"

interface Course {
  id: number;
  title: string;
  description: string | null;
  thumbnail: string | null;
  modules: {
    id: number;
    order: number;
    title: string;
  }[];
}

export function CourseSidebarContent() {
  const [joinedCourses, setJoinedCourses] = useState<Course[]>([])

  useEffect(() => {
    const fetchJoinedCourses = async () => {
      const courses = await getJoinedCourses()
      setJoinedCourses(courses)
    }
    fetchJoinedCourses()
  }, [])

  if (joinedCourses.length === 0) {
    return (
      <div className="flex items-center justify-center p-6 text-sm text-muted-foreground">
        <div className="text-center">
          <GraduationCap className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-2">Anda belum bergabung dengan kursus apapun</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-1.5 p-1.5">
      {joinedCourses.map((course) => {
        const firstModule = course.modules[0];
        const moduleCount = course.modules.length;
        const progress = Math.floor(Math.random() * 100); // Example progress

        return (
          <Link
            href={`/courses/${course.id}`}
            key={course.id}
            className="group relative block overflow-hidden rounded-lg transition-all duration-200 hover:ring-2 hover:ring-primary/20 active:scale-[0.98]"
          >
            <div className="relative w-full" style={{ aspectRatio: '16/7' }}>
              <Image
                src={course.thumbnail || "/images/course.jpg"}
                alt={course.title}
                fill
                className="object-cover transition-transform duration-200 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 300px"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/10" />

              {/* Content Overlay */}
              <div className="absolute inset-0 p-2.5 flex flex-col justify-between bg-background/10">
                <div className="flex items-start justify-between">
                  <div className="px-1.5 py-0.5 rounded-md bg-primary/20 backdrop-blur-sm text-[10px] font-medium text-primary-foreground">
                    {moduleCount} Modul
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium leading-tight text-foreground mb-1">
                    {course.title}
                  </h3>

                  {firstModule && (
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <BookOpen className="h-3 w-3" />
                      <span className="truncate">{firstModule.title}</span>
                    </div>
                  )}

                  {/* Progress Bar */}
                  <div className="mt-1.5 h-0.5 w-full rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
