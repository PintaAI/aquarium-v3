'use client'

import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { User, BarChart, Clock } from "lucide-react";

interface CourseHeaderProps {
  id: number;
  title: string;
  thumbnail: string | null;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
  level: string;
  moduleCount?: number;
}

export function CourseHeader({ 
  id, 
  title, 
  thumbnail, 
  author, 
  level,
  moduleCount = 0
}: CourseHeaderProps) {
  const { data: session } = useSession();
  const isAuthor = session?.user?.id === author.id;

  return (
    <div className="bg-card rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-border">
      {thumbnail && (
        <div className="relative aspect-video w-full max-h-[130px]">
          <Image
            src={thumbnail}
            alt={title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-3xl font-bold text-primary">{title}</h1>
          {isAuthor && (
            <Link href={`/courses/${id}/edit-course`}>
              <Button variant="outline" size="sm">
                Edit Course
              </Button>
            </Link>
          )}
        </div>

        <div className="flex justify-between text-sm text-muted-foreground mb-6">
          <div className="flex items-center">
            <User className="mr-2" size={16} />
            <span>{author.name}</span>
          </div>
          <div className="flex items-center">
            <BarChart className="mr-2" size={16} />
            <span>{level}</span>
          </div>
          <div className="flex items-center">
            <Clock className="mr-2" size={16} />
            <span>{moduleCount} modules</span>
          </div>
        </div>

        <div className="flex items-center gap-x-2">
          {author.image && (
            <Image
              src={author.image}
              alt={author.name || "Author"}
              width={32}
              height={32}
              className="rounded-full"
            />
          )}
          <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" asChild>
            <Link href={`/courses/${id}/modules/${moduleCount > 0 ? '1' : ''}`}>
              Start Course
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
