'use server'

import { db } from '@/lib/db'
import { revalidatePath } from "next/cache"
import { currentUser } from '@/lib/auth'
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

const moduleSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  jsonDescription: z.string(),
  htmlDescription: z.string(),
  order: z.number(),
  courseId: z.number()
})

// Fungsi baru untuk mendapatkan modul pertama
export async function getFirstModule(courseId: number) {
  try {
    const firstModule = await db.module.findFirst({
      where: {
        courseId: courseId
      },
      orderBy: {
        order: 'asc'
      },
      select: {
        id: true
      }
    });

    return firstModule;
  } catch (error) {
    console.error('Failed to get first module:', error)
    return null;
  }
}

// Fungsi untuk join course
export async function joinCourse(courseId: number) {
  try {
    const user = await currentUser()
    if (!user) {
      throw new Error('Unauthorized')
    }

    // Cek apakah user sudah join course
    const course = await db.course.findUnique({
      where: {
        id: courseId,
      },
      include: {
        members: {
          where: {
            id: user.id
          }
        }
      }
    })

    if (!course) {
      throw new Error('Course not found')
    }

    if (course.members.length > 0) {
      throw new Error('Already joined this course')
    }

    // Join course
    await db.course.update({
      where: {
        id: courseId
      },
      data: {
        members: {
          connect: {
            id: user.id
          }
        }
      }
    })

    revalidatePath(`/courses/${courseId}`)
    return { success: true }
  } catch (error) {
    console.error('Failed to join course:', error)
    return { success: false, error: 'Failed to join course' }
  }
}

export async function createModule(data: z.infer<typeof moduleSchema>) {
  try {
    const user = await currentUser()
    if (!user || user.role !== 'GURU') {
      throw new Error('Unauthorized')
    }

    // Verify user owns the course
    const course = await db.course.findUnique({
      where: {
        id: data.courseId,
        authorId: user.id
      }
    })

    if (!course) {
      throw new Error('Unauthorized')
    }

    const module = await db.module.create({
      data: {
        ...data,
        courseId: course.id
      }
    })

    revalidatePath(`/courses/${course.id}`)
    return { success: true, moduleId: module.id }
  } catch (error) {
    console.error('Failed to create module:', error)
    return { success: false, error: 'Failed to create module' }
  }
}

export async function updateModule(moduleId: number, data: z.infer<typeof moduleSchema>) {
  try {
    const user = await currentUser()
    if (!user || user.role !== 'GURU') {
      throw new Error('Unauthorized')
    }

    // Verify user owns the course
    const course = await db.course.findUnique({
      where: {
        id: data.courseId,
        authorId: user.id
      }
    })

    if (!course) {
      throw new Error('Unauthorized')
    }

    const module = await db.module.update({
      where: { 
        id: moduleId,
        courseId: course.id
      },
      data
    })

    revalidatePath(`/courses/${course.id}`)
    revalidatePath(`/courses/${course.id}/modules/${moduleId}`)
    return { success: true, moduleId: module.id }
  } catch (error) {
    console.error('Failed to update module:', error)
    return { success: false, error: 'Failed to update module' }
  }
}

export async function deleteModule(moduleId: number, courseId: number) {
  try {
    const user = await currentUser()
    if (!user || user.role !== 'GURU') {
      throw new Error('Unauthorized')
    }

    // Verify user owns the course
    const course = await db.course.findUnique({
      where: {
        id: courseId,
        authorId: user.id
      }
    })

    if (!course) {
      throw new Error('Unauthorized')
    }

    await db.module.delete({
      where: {
        id: moduleId,
        courseId: courseId
      }
    })

    revalidatePath(`/courses/${courseId}`)
    return { success: true }
  } catch (error) {
    console.error('Failed to delete module:', error)
    return { success: false, error: 'Failed to delete module' }
  }
}

export async function reorderModules(courseId: number, moduleIds: number[]) {
  try {
    const user = await currentUser()
    if (!user || user.role !== 'GURU') {
      throw new Error('Unauthorized')
    }

    // Verify user owns the course
    const course = await db.course.findUnique({
      where: {
        id: courseId,
        authorId: user.id
      }
    })

    if (!course) {
      throw new Error('Unauthorized')
    }

    // Update each module's order based on its position in the moduleIds array
    await Promise.all(
      moduleIds.map(async (moduleId, index) => {
        await db.module.update({
          where: {
            id: moduleId,
            courseId: courseId,
          },
          data: {
            order: index,
          },
        });
      })
    );

    revalidatePath(`/courses/${courseId}`)
    return { success: true }
  } catch (error) {
    console.error("Error reordering modules:", error)
    return { success: false }
  }
}

export async function getModule(courseId: number, moduleId: number) {
  try {
    // Only select htmlDescription for rendering, not jsonDescription
    const module = await db.module.findUnique({
      where: {
        id: moduleId,
        courseId: courseId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        htmlDescription: true,
        order: true,
        courseId: true,
        course: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true
              }
            },
            modules: {
              select: {
                id: true,
                title: true,
                description: true,
                order: true,
                courseId: true,
              },
              orderBy: {
                order: 'asc'
              }
            }
          }
        }
      }
    });

    if (!module) {
      console.log(`No module found with id: ${moduleId} in course: ${courseId}`);
      return null;
    }

    return module;
  } catch (error) {
    console.error(`Failed to fetch module with id ${moduleId}:`, error);
    throw error;
  }
}

export async function getModuleForEditing(courseId: number, moduleId: number) {
  try {
    // Include jsonDescription when editing is needed
    const module = await db.module.findUnique({
      where: {
        id: moduleId,
        courseId: courseId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        jsonDescription: true,
        htmlDescription: true,
        order: true,
        courseId: true,
      }
    });

    if (!module) {
      console.log(`No module found with id: ${moduleId} in course: ${courseId}`);
      return null;
    }

    return module;
  } catch (error) {
    console.error(`Failed to fetch module with id ${moduleId}:`, error);
    throw error;
  }
}

export async function getModules(courseId: number) {
  try {
    const modules = await db.module.findMany({
      where: {
        courseId: courseId
      },
      select: {
        id: true,
        title: true,
        description: true,
        order: true,
        courseId: true,
      },
      orderBy: {
        order: 'asc'
      }
    });

    return modules;
  } catch (error) {
    console.error(`Failed to fetch modules for course ${courseId}:`, error);
    throw error;
  }
}

export async function getNextModule(courseId: number, currentModuleId: number) {
  try {
    const currentModule = await db.module.findUnique({
      where: { 
        id: currentModuleId,
        courseId: courseId
      },
      select: { order: true }
    });

    if (!currentModule) {
      throw new Error("Current module not found");
    }

    const nextModule = await db.module.findFirst({
      where: {
        courseId: courseId,
        order: {
          gt: currentModule.order
        }
      },
      orderBy: {
        order: 'asc'
      },
      select: {
        id: true,
        title: true,
        description: true,
        htmlDescription: true,
        order: true,
        courseId: true,
      }
    });

    return nextModule;
  } catch (error) {
    console.error(`Failed to get next module:`, error);
    throw error;
  }
}

export async function getPreviousModule(courseId: number, currentModuleId: number) {
  try {
    const currentModule = await db.module.findUnique({
      where: { 
        id: currentModuleId,
        courseId: courseId
      },
      select: { order: true }
    });

    if (!currentModule) {
      throw new Error("Current module not found");
    }

    const previousModule = await db.module.findFirst({
      where: {
        courseId: courseId,
        order: {
          lt: currentModule.order
        }
      },
      orderBy: {
        order: 'desc'
      },
      select: {
        id: true,
        title: true,
        description: true,
        htmlDescription: true,
        order: true,
        courseId: true,
      }
    });

    return previousModule;
  } catch (error) {
    console.error(`Failed to get previous module:`, error);
    throw error;
  }
}

export async function completeModule(courseId: number, moduleId: number) {
  try {
    const user = await currentUser()
    if (!user) {
      throw new Error('Unauthorized')
    }

    // Check if the completion record already exists
    const existingCompletion = await db.userModuleCompletion.findUnique({
      where: {
        userId_moduleId: {
          userId: user.id,
          moduleId: moduleId
        }
      }
    });

    if (existingCompletion) {
      // Update the existing record
      await db.userModuleCompletion.update({
        where: {
          id: existingCompletion.id
        },
        data: {
          isCompleted: true
        }
      });
    } else {
      // Create a new completion record
      await db.userModuleCompletion.create({
        data: {
          userId: user.id,
          moduleId: moduleId,
          isCompleted: true
        }
      });
    }

    revalidatePath(`/courses/${courseId}`)
    revalidatePath(`/courses/${courseId}/modules/${moduleId}`)
    return { success: true }
  } catch (error) {
    console.error('Failed to complete module:', error)
    return { success: false, error: 'Failed to complete module' }
  }
}
