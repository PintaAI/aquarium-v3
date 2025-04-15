import { formatDistanceToNow, format, parseISO } from 'date-fns'
import { id } from 'date-fns/locale/id' // Import Indonesian locale
import { enUS } from 'date-fns/locale/en-US' // Import English locale
import { toZonedTime } from 'date-fns-tz'

/**
 * Utility functions for handling dates and times across the application
 * Ensures consistent timezone handling between server and client
 */

/**
 * Convert a UTC date from the database to the user's local timezone
 */
export function toLocalTime(date: Date | string): Date {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date
  return toZonedTime(parsedDate, Intl.DateTimeFormat().resolvedOptions().timeZone)
}

/**
 * Convert a local date to UTC for database storage
 * Note: For datetime-local inputs, the value is already in UTC format,
 * so we just need to parse it without additional conversion
 */
export function toUTC(date: Date | string): Date {
  if (typeof date === 'string') {
    return parseISO(date)  // For datetime-local inputs, already in UTC
  }
  // For Date objects, convert from local to UTC
  const utcTime = date.getTime() - (date.getTimezoneOffset() * 60000)
  return new Date(utcTime)
}

/**
 * Format a UTC date from the database for display in the user's timezone
 * Note: Use this for displaying dates from the database
 */
export function formatLocalDate(date: Date | string, formatStr: string = 'PPpp'): string {
  const localDate = toLocalTime(date)
  return format(localDate, formatStr)
}

/**
 * Get relative time string (e.g. "2 hours ago") from a UTC database date
 * Note: Use this for displaying relative times from database dates
 */
export function getRelativeTime(date: Date | string, useIndonesian: boolean = true): string {
  const localDate = toLocalTime(date)
  return formatDistanceToNow(localDate, { 
    addSuffix: true, 
    locale: useIndonesian ? id : enUS 
  })
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
  return new Date()
}

/**
 * Compare two dates in the same timezone
 */
export function compareDates(date1: Date | string, date2: Date | string): number {
  const local1 = toLocalTime(date1)
  const local2 = toLocalTime(date2)
  return local1.getTime() - local2.getTime()
}
