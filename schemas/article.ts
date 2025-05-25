import * as z from "zod"

export const addArticleSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  jsonDescription: z.string().min(1, "Content is required"),
  htmlDescription: z.string().min(1, "Content is required"),
})

export const updateArticleSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  jsonDescription: z.string().min(1, "Content is required"),
  htmlDescription: z.string().min(1, "Content is required"),
})
