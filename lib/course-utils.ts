import { CourseType } from "@prisma/client"

export type EventStatus = 'upcoming' | 'active' | 'expired'

export interface CourseWithEventInfo {
  id: number
  type: CourseType
  eventStartDate: Date | null
  eventEndDate: Date | null
  isLocked: boolean
  members?: Array<{ id: string }>
}

/**
 * Get the status of an event course
 */
export function getEventStatus(course: CourseWithEventInfo): EventStatus | null {
  if (course.type !== 'EVENT' || !course.eventStartDate || !course.eventEndDate) {
    return null
  }

  const now = new Date()
  const startDate = new Date(course.eventStartDate)
  const endDate = new Date(course.eventEndDate)

  if (now < startDate) {
    return 'upcoming'
  } else if (now >= startDate && now <= endDate) {
    return 'active'
  } else {
    return 'expired'
  }
}

/**
 * Check if a course should be locked based on its type and event status
 */
export function shouldCourseBeLocked(course: CourseWithEventInfo): boolean {
  if (course.type === 'NORMAL') {
    return course.isLocked
  }
  
  if (course.type === 'EVENT') {
    const eventStatus = getEventStatus(course)
    // Event courses are locked if they haven't started yet or have expired
    return eventStatus === 'upcoming' || eventStatus === 'expired' || course.isLocked
  }

  return course.isLocked
}

/**
 * Check if a user can access a course
 */
export function canUserAccessCourse(course: CourseWithEventInfo, userId?: string): boolean {
  // Check if user is a member
  const isMember = userId && course.members?.some(member => member.id === userId)
  
  if (!isMember) {
    return false
  }

  // If course is locked based on event status, user cannot access
  return !shouldCourseBeLocked(course)
}

/**
 * Get display text for event status
 */
export function getEventStatusText(status: EventStatus | null): string {
  switch (status) {
    case 'upcoming':
      return 'Segera Dimulai'
    case 'active':
      return 'Sedang Berlangsung'
    case 'expired':
      return 'Telah Berakhir'
    default:
      return ''
  }
}

/**
 * Get time remaining until event starts or ends
 */
export function getTimeRemaining(course: CourseWithEventInfo): {
  timeLeft: string
  isActive: boolean
} | null {
  if (course.type !== 'EVENT' || !course.eventStartDate || !course.eventEndDate) {
    return null
  }

  const now = new Date()
  const startDate = new Date(course.eventStartDate)
  const endDate = new Date(course.eventEndDate)
  const eventStatus = getEventStatus(course)

  if (eventStatus === 'upcoming') {
    const timeDiff = startDate.getTime() - now.getTime()
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) {
      return {
        timeLeft: `${days} hari lagi`,
        isActive: false
      }
    } else if (hours > 0) {
      return {
        timeLeft: `${hours} jam lagi`,
        isActive: false
      }
    } else {
      return {
        timeLeft: 'Segera dimulai',
        isActive: false
      }
    }
  } else if (eventStatus === 'active') {
    const timeDiff = endDate.getTime() - now.getTime()
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) {
      return {
        timeLeft: `${days} hari tersisa`,
        isActive: true
      }
    } else if (hours > 0) {
      return {
        timeLeft: `${hours} jam tersisa`,
        isActive: true
      }
    } else {
      return {
        timeLeft: 'Segera berakhir',
        isActive: true
      }
    }
  }

  return null
}

/**
 * Format date for display
 */
export function formatEventDate(date: Date | null): string {
  if (!date) return ''
  
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}
