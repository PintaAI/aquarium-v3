'use server'

import { db } from '@/lib/db'
import { revalidatePath } from "next/cache"
import { currentUser } from '@/lib/auth'
import { z } from 'zod'
import { moduleSchema } from '@/types/module'

// Fungsi baru untuk mendapatkan modul pertama
export async function getFirstModule(courseId: number) {
  try {
    const firstModuleItem = await db.module.findFirst({
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

    return firstModuleItem;
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

// Fungsi untuk unjoin course
export async function unjoinCourse(courseId: number) {
  try {
    const user = await currentUser()
    if (!user) {
      throw new Error('Unauthorized')
    }

    // Cek apakah course ada dan user adalah member
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

    if (course.members.length === 0) {
      throw new Error('Not a member of this course')
    }

    // Unjoin course
    await db.course.update({
      where: {
        id: courseId
      },
      data: {
        members: {
          disconnect: {
            id: user.id
          }
        }
      }
    })

    revalidatePath(`/courses/${courseId}`)
    return { success: true }
  } catch (error) {
    console.error('Failed to unjoin course:', error)
    return { success: false, error: 'Failed to unjoin course' }
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

    const moduleItem = await db.module.create({
      data: {
        ...data,
        courseId: course.id
      }
    })

    revalidatePath(`/courses/${course.id}`)
    return { success: true, moduleId: moduleItem.id }
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

    const moduleItem = await db.module.update({
      where: { 
        id: moduleId,
        courseId: course.id
      },
      data
    })

    revalidatePath(`/courses/${course.id}`)
    revalidatePath(`/courses/${course.id}/modules/${moduleId}`)
    return { success: true, moduleId: moduleItem.id }
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
    const user = await currentUser()
    if (!user) {
      throw new Error('Unauthorized')
    }
    
    // Only select htmlDescription for rendering, not jsonDescription
    const moduleItem = await db.module.findUnique({
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
        completions: {
          where: {
            userId: user.id
          },
          select: {
            isCompleted: true
          }
        },
        course: {
          select: {
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
            completions: {
              where: {
                userId: user.id,
                isCompleted: true
              },
              select: {
                isCompleted: true
              }
            }
          },
          orderBy: {
            order: 'asc'
          }
            }
          }
        }
      }
    });

    if (!moduleItem) {
      console.log(`No module found with id: ${moduleId} in course: ${courseId}`);
      return null;
    }

    return {
      ...moduleItem,
      userCompletions: moduleItem.completions
    };
  } catch (error) {
    console.error(`Failed to fetch module with id ${moduleId}:`, error);
    throw error;
  }
}

export async function getModuleForEditing(courseId: number, moduleId: number) {
  try {
    // Include jsonDescription when editing is needed
    const moduleItem = await db.module.findUnique({
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

    if (!moduleItem) {
      console.log(`No module found with id: ${moduleId} in course: ${courseId}`);
      return null;
    }

    return moduleItem;
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
    const currentModuleItem = await db.module.findUnique({
      where: { 
        id: currentModuleId,
        courseId: courseId
      },
      select: { order: true }
    });

    if (!currentModuleItem) {
      throw new Error("Current module not found");
    }

    const nextModuleItem = await db.module.findFirst({
      where: {
        courseId: courseId,
        order: {
          gt: currentModuleItem.order
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

    return nextModuleItem;
  } catch (error) {
    console.error(`Failed to get next module:`, error);
    throw error;
  }
}

export async function getPreviousModule(courseId: number, currentModuleId: number) {
  try {
    const currentModuleItem = await db.module.findUnique({
      where: { 
        id: currentModuleId,
        courseId: courseId
      },
      select: { order: true }
    });

    if (!currentModuleItem) {
      throw new Error("Current module not found");
    }

    const previousModuleItem = await db.module.findFirst({
      where: {
        courseId: courseId,
        order: {
          lt: currentModuleItem.order
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

    return previousModuleItem;
  } catch (error) {
    console.error(`Failed to get previous module:`, error);
    throw error;
  }
}

export async function completeModule(courseId: number, moduleId: number, completed: boolean = true) {
  try {
    const user = await currentUser()
    if (!user) {
      throw new Error('Unauthorized')
    }

    const existingCompletion = await db.userModuleCompletion.findUnique({
      where: {
        userId_moduleId: {
          userId: user.id,
          moduleId: moduleId
        }
      }
    });

    if (existingCompletion) {
      await db.userModuleCompletion.update({
        where: {
          id: existingCompletion.id
        },
        data: {
          isCompleted: completed
        }
      });
    } else {
      await db.userModuleCompletion.create({
        data: {
          userId: user.id,
          moduleId: moduleId,
          isCompleted: completed
        }
      });
    }

    revalidatePath(`/courses/${courseId}`)
    revalidatePath(`/courses/${courseId}/modules/${moduleId}`)
    return { success: true }
  } catch (error) {
    console.error('Failed to update module completion:', error)
    return { success: false, error: 'Failed to update module completion' }
  }
}
