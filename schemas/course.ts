import { z } from "zod"
import { CourseLevel, CourseType } from "@prisma/client"

export const addCourseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  level: z.nativeEnum(CourseLevel),
  type: z.nativeEnum(CourseType).default("NORMAL"),
  eventStartDate: z.date().optional().nullable(),
  eventEndDate: z.date().optional().nullable(),
  jsonDescription: z.string(),
  htmlDescription: z.string(),
  thumbnail: z.string().nullable().optional(),
  isCompleted: z.boolean().default(false),
  isLocked: z.boolean().default(false),
}).refine((data) => {
  // If course type is EVENT, both start and end dates are required
  if (data.type === "EVENT") {
    return data.eventStartDate && data.eventEndDate
  }
  return true
}, {
  message: "Event courses must have both start and end dates",
  path: ["eventStartDate"]
}).refine((data) => {
  // If both dates are provided, end date must be after start date
  if (data.eventStartDate && data.eventEndDate) {
    return data.eventEndDate > data.eventStartDate
  }
  return true
}, {
  message: "Event end date must be after start date",
  path: ["eventEndDate"]
})

export const updateCourseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  level: z.nativeEnum(CourseLevel),
  type: z.nativeEnum(CourseType).default("NORMAL"),
  eventStartDate: z.date().optional().nullable(),
  eventEndDate: z.date().optional().nullable(),
  jsonDescription: z.string(),
  htmlDescription: z.string(),
  thumbnail: z.string().nullable(),
  isCompleted: z.boolean().default(false),
  isLocked: z.boolean().default(false),
}).refine((data) => {
  // If course type is EVENT, both start and end dates are required
  if (data.type === "EVENT") {
    return data.eventStartDate && data.eventEndDate
  }
  return true
}, {
  message: "Event courses must have both start and end dates",
  path: ["eventStartDate"]
}).refine((data) => {
  // If both dates are provided, end date must be after start date
  if (data.eventStartDate && data.eventEndDate) {
    return data.eventEndDate > data.eventStartDate
  }
  return true
}, {
  message: "Event end date must be after start date",
  path: ["eventEndDate"]
})

export type AddCourseInput = z.infer<typeof addCourseSchema>
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>
