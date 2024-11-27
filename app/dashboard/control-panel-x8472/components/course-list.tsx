"use client"

import { useState, useEffect } from "react"
import { Course, getCourses } from "@/actions/course-actions"
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle 
} from "@/components/ui/card"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Filter, RefreshCcw } from "lucide-react"
import { CourseActions } from "./course-actions"

export function CourseList() {
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadCourses = async () => {
    setIsLoading(true)
    try {
      const data = await getCourses()
      setCourses(data)
    } catch (error) {
      console.error("Error loading courses:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCourses()
  }, [])

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b bg-muted/10 px-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Manajemen Kursus</CardTitle>
            <CardDescription>
              Daftar semua kursus yang tersedia di platform.
            </CardDescription>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex w-full max-w-sm items-center space-x-2">
              <Input 
                placeholder="Cari kursus..." 
                className="h-8"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" size="sm" onClick={loadCourses}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6">Judul</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Pembuat</TableHead>
              <TableHead>Tanggal Dibuat</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course.id}>
                <TableCell className="font-medium pl-6">
                  {course.title}
                </TableCell>
                <TableCell>
                  {course.level}
                </TableCell>
                <TableCell>
                  {course.author.name}
                </TableCell>
                <TableCell>
                  {new Date(course.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <CourseActions 
                    course={course} 
                    onDeleted={loadCourses}
                  />
                </TableCell>
              </TableRow>
            ))}
            {courses.length === 0 && !isLoading && (
              <TableRow>
                <TableCell 
                  colSpan={5} 
                  className="h-24 text-center text-muted-foreground"
                >
                  Tidak ada kursus yang ditemukan
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
