import { format, startOfWeek, addDays, startOfMonth, endOfMonth, isSameDay } from 'date-fns'

/**
 * Get the Monday of the week containing a given date
 */
export function getMondayOfWeek(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: 1 }) // 1 = Monday
}

/**
 * Format a date as YYYY-MM-DD
 */
export function formatDateString(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

/**
 * Format a date for display in the header (e.g., "16th January 2026")
 */
export function formatReportDate(date: Date): string {
  const day = date.getDate()
  const suffix = getOrdinalSuffix(day)
  return `${day}${suffix} ${format(date, 'MMMM yyyy')}`
}

/**
 * Get ordinal suffix for a day number
 */
function getOrdinalSuffix(day: number): string {
  if (day >= 11 && day <= 13) return 'th'
  switch (day % 10) {
    case 1: return 'st'
    case 2: return 'nd'
    case 3: return 'rd'
    default: return 'th'
  }
}

/**
 * Get all weeks (as Monday dates) for a given month
 */
export function getWeeksInMonth(year: number, month: number): Date[] {
  const weeks: Date[] = []
  const firstDay = startOfMonth(new Date(year, month - 1)) // month is 0-indexed in Date
  const lastDay = endOfMonth(firstDay)

  let monday = getMondayOfWeek(firstDay)

  // Include weeks that have any overlap with this month
  while (monday <= lastDay) {
    const sunday = addDays(monday, 6)
    if (sunday >= firstDay) {
      weeks.push(new Date(monday))
    }
    monday = addDays(monday, 7)
  }

  return weeks
}

/**
 * Format a week label (e.g., "Week of Jan 6")
 */
export function formatWeekLabel(date: Date): string {
  return `Week of ${format(date, 'MMM d')}`
}

/**
 * Get the Friday of a week (typical report day)
 */
export function getFridayOfWeek(monday: Date): Date {
  return addDays(monday, 4)
}

/**
 * Check if two dates represent the same week
 */
export function isSameWeek(date1: Date, date2: Date): boolean {
  const monday1 = getMondayOfWeek(date1)
  const monday2 = getMondayOfWeek(date2)
  return isSameDay(monday1, monday2)
}

/**
 * Combine class names (simple version of clsx)
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}
