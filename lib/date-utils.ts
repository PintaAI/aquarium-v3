import { formatDistanceToNow, format, parseISO } from 'date-fns'
import { id } from 'date-fns/locale/id' // Import Indonesian locale
import { toZonedTime,} from 'date-fns-tz'

/**
 * Utility functions for handling dates and times across the application
 * Ensures consistent timezone handling between server and client
 */

/**
 * Convert a UTC date to the user's local timezone
 */
export function toLocalTime(date: Date | string): Date {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date
  return toZonedTime(parsedDate, Intl.DateTimeFormat().resolvedOptions().timeZone)
}

/**
 * Convert a local date to UTC for server storage
 * Uses date-fns-tz to handle timezone conversions correctly
 */
export function toUTC(date: Date | string): Date {
  const parsedDate = typeof date === 'string' ? parseISO(date) : new Date(date)
  // Get the timestamp in UTC by using the local timezone offset
  const utcTime = parsedDate.getTime() - (parsedDate.getTimezoneOffset() * 60000)
  return new Date(utcTime)
}

/**
 * Format a date for display in the user's timezone
 */
export function formatLocalDate(date: Date | string, formatStr: string = 'PPpp'): string {
  const localDate = toLocalTime(date)
  return format(localDate, formatStr)
}

/**
 * Get relative time string (e.g. "2 hours ago")
 */
export function getRelativeTime(date: Date | string): string {
  const localDate = toLocalTime(date)
  // Add Indonesian locale to formatDistanceToNow
  return formatDistanceToNow(localDate, { addSuffix: true, locale: id }) 
}

/**
 * Format a date for ISO string (useful for input fields)
 */
export function formatForInput(date: Date | string): string {
  const localDate = toLocalTime(date)
  return format(localDate, "yyyy-MM-dd'T'HH:mm")
}

/**
 * Get current time in user's timezone
 */
export function getCurrentLocalTime(): Date {
  return toLocalTime(new Date())
}

/**
 * Compare two dates in the same timezone
 */
export function compareDates(date1: Date | string, date2: Date | string): number {
  const local1 = toLocalTime(date1)
  const local2 = toLocalTime(date2)
  return local1.getTime() - local2.getTime()
}
