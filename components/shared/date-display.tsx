'use client';

import { formatLocalDate, getRelativeTime } from '@/lib/date-utils'

interface DateDisplayProps {
  date: Date | string
  format?: string
  relative?: boolean
  className?: string
}

/**
 * Component for consistently displaying dates across the application
 * Automatically handles timezone conversions
 * 
 * @example
 * // Display a relative time (e.g. "2 hours ago")
 * <DateDisplay date={someDate} relative />
 * 
 * // Display a formatted date (e.g. "Apr 12, 2025 8:04 PM")
 * <DateDisplay date={someDate} format="PPpp" />
 */
export function DateDisplay({ date, format, relative, className }: DateDisplayProps) {
  if (relative) {
    return (
      <time dateTime={date.toString()} className={className}>
        {getRelativeTime(date)}
      </time>
    )
  }
  
  return (
    <time dateTime={date.toString()} className={className}>
      {formatLocalDate(date, format)}
    </time>
  )
}
