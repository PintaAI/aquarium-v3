const STORAGE_KEY = 'recentCourses'
const MAX_RECENT_ITEMS = 5

export interface RecentCourse {
  id: number
  title: string
  description: string | null
  jsonDescription: string | null
  htmlDescription: string | null
  level: string
  thumbnail: string | null
  isLocked: boolean
  modules: Array<{
    id: number
    title: string
    order: number
    completions: Array<{
      isCompleted: boolean
    }>
  }>
  author: {
    id: string
    name: string | null
    image: string | null
  }
  createdAt: Date
  updatedAt: Date
  lastAccessed: Date
}

export function addToRecentCourses(course: Omit<RecentCourse, 'lastAccessed'>) {
  try {
    // Get existing items
    const storedItems = localStorage.getItem(STORAGE_KEY)
    let recentItems: RecentCourse[] = storedItems ? JSON.parse(storedItems) : []

    // Remove the item if it already exists (to avoid duplicates)
    recentItems = recentItems.filter(item => item.id !== course.id)

    // Add the new item at the beginning
    recentItems.unshift({
      ...course,
      lastAccessed: new Date()
    })

    // Limit to MAX_RECENT_ITEMS
    if (recentItems.length > MAX_RECENT_ITEMS) {
      recentItems = recentItems.slice(0, MAX_RECENT_ITEMS)
    }

    // Save back to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recentItems))
  } catch (error) {
    console.error('Error updating recent courses:', error)
  }
}

export function getRecentCourses(): RecentCourse[] {
  try {
    const storedItems = localStorage.getItem(STORAGE_KEY)
    return storedItems ? JSON.parse(storedItems) : []
  } catch (error) {
    console.error('Error getting recent courses:', error)
    return []
  }
}
