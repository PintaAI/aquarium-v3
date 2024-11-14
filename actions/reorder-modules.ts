'use server'

import { db } from "@/lib/db";

export async function reorderModules(courseId: number, moduleIds: number[]) {
  try {
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

    return { success: true };
  } catch (error) {
    console.error("Error reordering modules:", error);
    return { success: false };
  }
}
