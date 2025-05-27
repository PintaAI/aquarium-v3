import { z } from "zod"
import { CourseLevel } from "@prisma/client"

export const addCourseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  level: z.nativeEnum(CourseLevel),
  jsonDescription: z.string(),
  htmlDescription: z.string(),
  thumbnail: z.string().nullable().optional(),
  isCompleted: z.boolean().default(false),
  isLocked: z.boolean().default(false),
})

export const updateCourseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  level: z.nativeEnum(CourseLevel),
  jsonDescription: z.string(),
  htmlDescription: z.string(),
  thumbnail: z.string().nullable(),
  isCompleted: z.boolean().default(false),
  isLocked: z.boolean().default(false),
})

export type AddCourseInput = z.infer<typeof addCourseSchema>
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>
