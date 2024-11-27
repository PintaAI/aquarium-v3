import { db } from "@/lib/db"
import { auth } from "@/auth"

export async function getAdminStats() {
  const session = await auth()
  
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }

  const [
    totalUsers,
    totalCourses,
    totalArticles,
    premiumUsers
  ] = await Promise.all([
    db.user.count(),
    db.course.count(),
    db.article.count(),
    db.user.count({
      where: {
        plan: "PREMIUM"
      }
    })
  ])

  return {
    users: {
      total: totalUsers,
      premium: premiumUsers
    },
    content: {
      courses: totalCourses,
      articles: totalArticles
    }
  }
}

export async function setUserRole(userId: string, role: "USER" | "GURU" | "MURID" | "ADMIN") {
  const session = await auth()
  
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }

  const user = await db.user.update({
    where: { id: userId },
    data: { role }
  })

  return user
}

export async function setUserPlan(userId: string, plan: "FREE" | "PREMIUM") {
  const session = await auth()
  
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }

  const user = await db.user.update({
    where: { id: userId },
    data: { plan }
  })

  return user
}

export async function getUserList() {
  const session = await auth()
  
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }

  const users = await db.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      plan: true,
      image: true, // Menambahkan image ke select
      createdAt: true
    },
    orderBy: {
      createdAt: "desc"
    }
  })

  return users
}
