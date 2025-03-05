import { db } from "@/lib/db"

export async function getModules(courseId: number) {
  try {
    const modules = await db.module.findMany({
      where: {
        courseId
      },
      select: {
        id: true,
        title: true,
        description: true,
        order: true,
      },
      orderBy: {
        order: 'asc'
      }
    })

    return modules
  } catch (error) {
    console.error("Error fetching modules:", error)
    return []
  }
}

export async function getModule(id: number) {
  try {
    const moduleData = await db.module.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
      }
    })

    return moduleData
  } catch (error) {
    console.error("Error fetching module:", error)
    return null
  }
}
