'use server'

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { currentUser } from "@/lib/auth"
import { auth } from "@/auth"
import { addArticleSchema, updateArticleSchema } from "@/schemas/article"
import { z } from "zod"

export interface Article {
  id: number
  title: string
  description: string | null
  jsonDescription: string
  htmlDescription: string
  createdAt: Date
  updatedAt: Date
  author: {
    id: string
    name: string | null
    image: string | null
  }
}

export async function addArticle(data: z.infer<typeof addArticleSchema>) {
  try {
    // Validate input data
    const validatedData = addArticleSchema.parse(data)
    
    const user = await currentUser()

    if (!user || user.role !== 'GURU') {
      throw new Error('Unauthorized')
    }

    const article = await db.article.create({
      data: {
        ...validatedData,
        authorId: user.id,
      },
    })

    revalidatePath('/artikel')
    return { success: true, articleId: article.id }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    console.error('Failed to add article:', error)
    return { success: false, error: 'Failed to add article' }
  }
}

export async function updateArticle(articleId: number, data: z.infer<typeof updateArticleSchema>) {
  try {
    // Validate input data
    const validatedData = updateArticleSchema.parse(data)

    const user = await currentUser()
    if (!user) {
      throw new Error('Unauthorized')
    }

    // Verify user owns the article
    const article = await db.article.findUnique({
      where: {
        id: articleId,
        authorId: user.id,
      },
    })

    if (!article) {
      throw new Error('Unauthorized')
    }

    const updatedArticle = await db.article.update({
      where: { id: articleId },
      data: validatedData,
    })

    revalidatePath(`/artikel/${articleId}`)
    return { success: true, articleId: updatedArticle.id }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    console.error('Failed to update article:', error)
    return { success: false, error: 'Failed to update article' }
  }
}

export async function deleteArticle(articleId: number) {
  try {
    const session = await auth()
    if (!session?.user) {
      throw new Error("Unauthorized")
    }

    // Verify user owns the article
    const article = await db.article.findUnique({
      where: {
        id: articleId,
        authorId: session.user.id,
      },
    })

    if (!article) {
      throw new Error("Unauthorized")
    }

    await db.article.delete({
      where: {
        id: articleId,
      },
    })

    revalidatePath('/artikel')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete article:', error)
    return { success: false, error: 'Failed to delete article' }
  }
}

export async function getArticle(articleId: number) {
  try {
    const article = await db.article.findUnique({
      where: { id: articleId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    if (!article) {
      return null
    }

    return article
  } catch (error) {
    console.error('Error fetching article data')
    throw error
  }
}

export async function getArticles(): Promise<Article[]> {
  try {
    const articles = await db.article.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    return articles as Article[]
  } catch (error) {
    console.error("Failed to fetch articles:", error)
    throw new Error("Failed to fetch articles")
  }
}
