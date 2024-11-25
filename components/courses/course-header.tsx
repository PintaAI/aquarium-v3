'use client'

import Image from "next/image";
import { Button } from "../ui/button";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { User, BarChart, Clock } from "lucide-react";
import { joinCourse, getFirstModule } from "@/actions/module-actions";
import { useState } from "react";
import { toast } from "react-hot-toast";

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
  isJoined?: boolean;
}

export function CourseHeader({ 
  id, 
  title, 
  thumbnail, 
  author, 
  level,
  moduleCount = 0,
  isJoined = false
}: CourseHeaderProps) {
  const { data: session } = useSession();
  const isAuthor = session?.user?.id === author.id;
  const [joining, setJoining] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigateToFirstModule = async () => {
    try {
      setLoading(true);
      const firstModule = await getFirstModule(id);
      
      if (!firstModule) {
        toast.error("Tidak ada modul yang tersedia");
        return;
      }

      window.location.href = `/courses/${id}/modules/${firstModule.id}`;
    } catch (error: any) {
      toast.error("Gagal memulai kursus");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCourse = async () => {
    try {
      setJoining(true);
      const result = await joinCourse(id);
      
      if (!result.success) {
        if (result.error?.includes('Already joined')) {
          toast.success("Anda sudah bergabung dengan kursus ini");
          // Jika sudah bergabung, langsung navigasi ke modul pertama
          await navigateToFirstModule();
          return;
        }
        throw new Error(result.error);
      }

      toast.success("Berhasil bergabung dengan kursus!");
      // Setelah berhasil bergabung, langsung navigasi ke modul pertama
      await navigateToFirstModule();
    } catch (error: any) {
      const errorMessage = error?.message || "Gagal bergabung dengan kursus";
      if (errorMessage.includes('Already joined')) {
        toast.error("Anda sudah bergabung dengan kursus ini");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setJoining(false);
    }
  };

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
          {!isAuthor && !isJoined && moduleCount > 0 && (
            <Button 
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleJoinCourse}
              disabled={joining || loading}
            >
              {joining ? "Bergabung..." : "Gabung Kursus"}
            </Button>
          )}
          {(isAuthor || isJoined) && moduleCount > 0 && (
            <Button 
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={navigateToFirstModule}
              disabled={loading}
            >
              {loading ? "Memuat..." : "Mulai Belajar"}
            </Button>
          )}
          {moduleCount === 0 && (
            <Button className="w-full" disabled>
              Belum Ada Modul
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
