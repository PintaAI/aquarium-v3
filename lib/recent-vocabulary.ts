const STORAGE_KEY = 'recentVocabulary'
const MAX_RECENT_ITEMS = 5

interface VocabularyUser {
  name: string | null
  role?: string
}

interface VocabularyItem {
  id: number
  korean: string
  indonesian: string
  isChecked: boolean
  type?: string
  collectionId?: number
  createdAt?: Date
  updatedAt?: Date
}

export interface RecentVocabulary {
  id: number
  title: string
  description: string | null
  user: VocabularyUser | null
  items: VocabularyItem[]
  isPublic: boolean
  lastAccessed: Date
}

export function addToRecentVocabulary(vocabulary: RecentVocabulary) {
  try {
    // Get existing items
    const storedItems = localStorage.getItem(STORAGE_KEY)
    let recentItems: RecentVocabulary[] = storedItems ? JSON.parse(storedItems) : []

    // Remove the item if it already exists (to avoid duplicates)
    recentItems = recentItems.filter(item => item.id !== vocabulary.id)

    // Add the new item at the beginning
    recentItems.unshift({
      ...vocabulary,
      lastAccessed: new Date()
    })

    // Limit to MAX_RECENT_ITEMS
    if (recentItems.length > MAX_RECENT_ITEMS) {
      recentItems = recentItems.slice(0, MAX_RECENT_ITEMS)
    }

    // Save back to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recentItems))
  } catch (error) {
    console.error('Error updating recent vocabulary:', error)
  }
}

export function getRecentVocabulary(): RecentVocabulary[] {
  try {
    const storedItems = localStorage.getItem(STORAGE_KEY)
    return storedItems ? JSON.parse(storedItems) : []
  } catch (error) {
    console.error('Error getting recent vocabulary:', error)
    return []
  }
}
