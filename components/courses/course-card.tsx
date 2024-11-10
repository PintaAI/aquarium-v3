import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

interface CourseCardProps {
  id: number;
  title: string;
  description: string | null;
  imageUrl?: string;
  progress?: number;
}

export function CourseCard({ id, title, description, imageUrl, progress }: CourseCardProps) {
  return (
    <Card className="w-full">
      <CardHeader className="relative h-48 p-0">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover rounded-t-lg"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-slate-200 rounded-t-lg flex items-center justify-center">
            <div className="text-slate-400 text-lg">No Image</div>
          </div>
        )}
      </CardHeader>
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-gray-600">{description || 'No description available'}</p>
        {progress !== undefined && (
          <div className="mt-4">
            <div className="h-2 bg-gray-200 rounded-full">
              <div 
                className="h-full bg-primary rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm text-gray-600">{progress}% Complete</span>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Link href={`/courses/${id}`} className="w-full">
          <Button className="w-full">View Course</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
