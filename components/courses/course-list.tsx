'use client';

import { useState, useMemo } from 'react';
import { Card,  CardDescription, CardTitle } from "@/components/ui/card";
import { compareDates } from "@/lib/date-utils";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusIcon, SearchIcon } from "lucide-react";
import { Course, deleteCourse } from "@/app/actions/course-actions";
import { toast } from 'sonner';
import Link from 'next/link';
import { CourseListCard } from './course-list-card';

interface CourseListProps {
  initialCourses: Course[];
  userRole: string | undefined;
  userId: string | undefined;
  error: string | null;
}

export default function CourseList({ initialCourses, userRole, userId, error }: CourseListProps) {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');

  const sortCourses = (coursesToSort: Course[], order: string) => {
    return [...coursesToSort].sort((a, b) => {
      const comparison = compareDates(a.createdAt, b.createdAt);
      return order === 'newest' ? -comparison : comparison;
    });
  };

  const filteredAndSortedCourses = useMemo(() => {
    const filtered = courses.filter((course) => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (course.description && course.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesLevel = selectedLevel === 'all' || course.level.toLowerCase() === selectedLevel;
      return matchesSearch && matchesLevel;
    });
    return sortCourses(filtered, sortOrder);
  }, [courses, searchTerm, selectedLevel, sortOrder]);

  const handleDeleteCourse = async (courseId: number) => {
    if (window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      const result = await deleteCourse(courseId);
      if (result.success) {
        setCourses(courses.filter(course => course.id !== courseId));
        toast.success('Course deleted successfully');
      } else {
        toast.error(result.error || 'Failed to delete course');
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-card rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-2 border border-border mb-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="relative w-full lg:w-96">
            <Input
              type="text"
              placeholder="Search courses..."
              className="pl-10 pr-4 py-2 w-full bg-background border-input focus:border-primary focus:ring-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-full sm:w-44 bg-background border-input">
                <SelectValue placeholder="Filter by level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-full sm:w-44 bg-background border-input">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {error && (
          <div className="text-destructive mb-4 col-span-full p-4 bg-destructive/10 rounded-lg" role="alert">
            {error}
          </div>
        )}

        {!error && filteredAndSortedCourses.length === 0 && (
          <div className="col-span-full text-center p-8 bg-card rounded-xl border border-border">
            <SearchIcon className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground text-lg">No courses found matching your criteria.</p>
          </div>
        )}
        
        {userRole === 'GURU' && (
          <Link href="/courses/create-course" passHref>
            <Card className="group h-full bg-primary/20 dark:bg-primary/10 border-dashed border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="flex flex-col h-full items-center justify-center text-center p-8">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <PlusIcon className="h-8 w-8 text-primary" aria-hidden="true" />
                </div>
                <CardTitle className="text-xl font-bold mb-2">Add New Course</CardTitle>
                <CardDescription className="text-sm">
                  Create and share your knowledge with students
                </CardDescription>
              </div>
            </Card>
          </Link>
        )}

        {filteredAndSortedCourses.map((course) => (
          <CourseListCard 
            key={course.id} 
            course={course} 
            isAuthor={course.author.id === userId}
            onDelete={() => handleDeleteCourse(course.id)}
          />
        ))}
      </div>
    </div>
  );
}
