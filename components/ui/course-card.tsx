import Image from "next/image"
import { Badge } from "./badge"
import { Button } from "./button"
import Link from "next/link"
import type { Course, User } from "@prisma/client"

type CourseWithAuthor = Course & {
  author: Pick<User, "name" | "image">
}

interface CourseCardProps {
  course: CourseWithAuthor
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border bg-background">
      {/* Thumbnail */}
      <div className="aspect-h-3 aspect-w-4 relative bg-muted sm:aspect-none sm:h-48">
        {course.thumbnail ? (
          <Image
            src={course.thumbnail}
            alt={course.title}
            className="h-full w-full object-cover object-center sm:h-full sm:w-full"
            width={400}
            height={300}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-muted">
            {course.icon ? (
              <Image 
                src={course.icon} 
                alt=""
                className="h-12 w-12"
                width={48}
                height={48}
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-secondary" />
            )}
          </div>
        )}

        {/* Level badge */}
        <div className="absolute right-2 top-2">
          <Badge variant="secondary">
            {course.level.charAt(0).toUpperCase() + course.level.slice(1).toLowerCase()}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col space-y-2 p-4">
        <h3 className="text-xl font-medium text-foreground">{course.title}</h3>
        
        {course.description && (
          <p className="line-clamp-3 flex-1 text-sm text-muted-foreground">
            {course.description}
          </p>
        )}

        {/* Author */}
        <div className="flex items-center space-x-2">
          {course.author.image ? (
            <Image
              src={course.author.image}
              alt={course.author.name ?? ""}
              className="h-6 w-6 rounded-full"
              width={24}
              height={24}
            />
          ) : (
            <div className="h-6 w-6 rounded-full bg-secondary" />
          )}
          <span className="text-sm text-muted-foreground">
            {course.author.name ?? "Unknown Author"}
          </span>
        </div>

        {/* Action */}
        <Link href={`/courses/${course.id}`}>
          <Button className="w-full" variant={course.isLocked ? "secondary" : "default"}>
            {course.isCompleted ? "Review Course" : course.isLocked ? "Locked" : "Start Learning"}
          </Button>
        </Link>
      </div>
    </div>
  )
}
