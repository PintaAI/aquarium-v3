import { z } from 'zod'

export interface Module {
  id: number
  title: string
  description: string
  htmlDescription: string
  order: number
  courseId: number
}

export interface ModuleWithJsonContent extends Module {
  jsonDescription: string
}

export const moduleSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  jsonDescription: z.string(),
  htmlDescription: z.string(),
  order: z.number(),
  courseId: z.number()
})
