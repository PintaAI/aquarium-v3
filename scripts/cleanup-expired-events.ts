import { db } from '@/lib/db'

/**
 * Cleanup script for expired event courses
 * This script should be run periodically (e.g., daily) to:
 * 1. Find event courses that have expired
 * 2. Clear all members from expired courses
 * 3. Lock the expired courses
 */
async function cleanupExpiredEventCourses() {
  console.log('Starting cleanup of expired event courses...')
  
  try {
    const now = new Date()
    
    // Find all expired event courses that still have members
    const expiredEventCourses = await db.course.findMany({
      where: {
        type: 'EVENT',
        eventEndDate: {
          lt: now
        },
        OR: [
          {
            members: {
              some: {}
            }
          },
          {
            isLocked: false
          }
        ]
      },
      include: {
        members: true,
        _count: {
          select: {
            members: true
          }
        }
      }
    })

    if (expiredEventCourses.length === 0) {
      console.log('✅ No expired event courses found that need cleanup')
      return
    }

    console.log(`🔍 Found ${expiredEventCourses.length} expired event courses to clean up`)

    // Process each expired course
    for (const course of expiredEventCourses) {
      const memberCount = course._count.members
      
      console.log(`📚 Processing course: "${course.title}" (ID: ${course.id})`)
      console.log(`   - Event ended: ${course.eventEndDate?.toISOString()}`)
      console.log(`   - Current members: ${memberCount}`)
      console.log(`   - Currently locked: ${course.isLocked}`)

      // Clear members and lock the course
      await db.course.update({
        where: { id: course.id },
        data: {
          isLocked: true,
          members: {
            set: [] // Remove all members
          }
        }
      })

      console.log(`   ✅ Cleaned up: removed ${memberCount} members and locked course`)
    }

    console.log(`\n🎉 Successfully cleaned up ${expiredEventCourses.length} expired event courses`)
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error)
    throw error
  }
}

// Run the cleanup if this script is executed directly
if (require.main === module) {
  cleanupExpiredEventCourses()
    .then(() => {
      console.log('✅ Cleanup completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Cleanup failed:', error)
      process.exit(1)
    })
}

export { cleanupExpiredEventCourses }
