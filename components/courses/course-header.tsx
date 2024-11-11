'use client'

import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSession } from "next-auth/react";

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
}

export function CourseHeader({ id, title, thumbnail, author, level }: CourseHeaderProps) {
  const { data: session } = useSession();
  const isAuthor = session?.user?.id === author.id;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      {/* Course Thumbnail */}
      <div className="relative aspect-video rounded-xl overflow-hidden">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-slate-200 flex items-center justify-center">
            <span className="text-slate-400">No thumbnail</span>
          </div>
        )}
      </div>

      {/* Course Info */}
      <div>
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-2xl font-bold">{title}</h1>
          {isAuthor && (
            <Link href={`/courses/${id}/edit-course`}>
              <Button variant="outline" size="sm">
                Edit Course
              </Button>
            </Link>
          )}
        </div>
        <div className="flex items-center gap-x-2 mb-4">
          {author.image && (
            <Image
              src={author.image}
              alt={author.name || "Author"}
              width={32}
              height={32}
              className="rounded-full"
            />
          )}
          <div>
            <p className="text-slate-600">By {author.name}</p>
            <p className="text-slate-600">Level: {level}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
