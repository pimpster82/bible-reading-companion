// Weekly Bible Reading Schedule - Dynamic Loader
// Automatically imports and manages yearly schedule files

// Import all available years
import { weeklyReadingSchedule2026 } from './weekly-reading-schedule-2026.js'

// When new years become available, add them here:
// import { weeklyReadingSchedule2027 } from './weekly-reading-schedule-2027.js'
// import { weeklyReadingSchedule2028 } from './weekly-reading-schedule-2028.js'

import { weeklyReadingSchedule2023 } from './weekly-reading-schedule-2023.js'
import { weeklyReadingSchedule2025 } from './weekly-reading-schedule-2025.js'
import { weeklyReadingSchedule2024 } from './weekly-reading-schedule-2024.js'
// Combine all years into one registry
const allSchedules = {
  2023: weeklyReadingSchedule2023,
  2024: weeklyReadingSchedule2024,
  2025: weeklyReadingSchedule2025,
  2026: weeklyReadingSchedule2026,
}

/**
 * Get schedule for a specific year
 * @param {number} year - The year (e.g., 2026)
 * @returns {Array} - Weekly schedule for that year, or empty array if not available
 */
export const getScheduleForYear = (year) => {
  return allSchedules[year] || []
}

/**
 * Get all available years
 * @returns {Array<number>} - List of years with available schedules (sorted)
 */
export const getAvailableYears = () => {
  return Object.keys(allSchedules).map(Number).sort()
}

/**
 * Check if a year is available
 * @param {number} year - The year to check
 * @returns {boolean} - True if schedule exists for this year
 */
export const isYearAvailable = (year) => {
  return year in allSchedules
}

/**
 * Get current week's reading based on meeting day
 * @param {number} meetingDay - Day of week (0=Sunday, 1=Monday, etc.)
 * @param {Date} date - Optional date to check (defaults to today)
 * @returns {Object|null} - Current week's reading schedule, or null if not found
 */
export const getCurrentWeekReading = (meetingDay = 1, date = null) => {
  // Use provided date or today
  const checkDate = date ? new Date(date) : new Date()
  checkDate.setHours(0, 0, 0, 0)

  const currentYear = checkDate.getFullYear()

  // Try current year first
  let schedule = getScheduleForYear(currentYear)

  // If not found, try next year (for end-of-year transitions)
  if (schedule.length === 0) {
    schedule = getScheduleForYear(currentYear + 1)
  }

  // If still no schedule, try previous year (for beginning-of-year)
  if (schedule.length === 0) {
    schedule = getScheduleForYear(currentYear - 1)
  }

  if (schedule.length === 0) {
    console.warn(`No schedule available for year ${currentYear}`)
    return null
  }

  // Find the most recent meeting day
  const todayDayOfWeek = checkDate.getDay()
  let daysSinceLastMeeting

  if (todayDayOfWeek >= meetingDay) {
    // Meeting day has already passed this week
    daysSinceLastMeeting = todayDayOfWeek - meetingDay
  } else {
    // Meeting day hasn't happened yet, use last week's meeting
    daysSinceLastMeeting = 7 - meetingDay + todayDayOfWeek
  }

  const lastMeetingDate = new Date(checkDate)
  lastMeetingDate.setDate(checkDate.getDate() - daysSinceLastMeeting)

  // Find which schedule week this meeting date falls into
  for (const week of schedule) {
    const scheduleStart = new Date(week.weekStart)
    scheduleStart.setHours(0, 0, 0, 0)

    const scheduleEnd = new Date(week.weekEnd)
    scheduleEnd.setHours(23, 59, 59, 999)

    // Check if the most recent meeting day falls within this schedule period
    if (lastMeetingDate >= scheduleStart && lastMeetingDate <= scheduleEnd) {
      return week
    }
  }

  console.warn('No matching week found for date:', checkDate.toISOString())
  return null
}

/**
 * Get reading by specific date
 * @param {Date|string} date - The date to look up
 * @returns {Object|null} - Week's reading for that date, or null
 */
export const getReadingByDate = (date) => {
  const targetDate = new Date(date)
  targetDate.setHours(0, 0, 0, 0)

  const year = targetDate.getFullYear()
  const schedule = getScheduleForYear(year)

  if (schedule.length === 0) {
    return null
  }

  for (const week of schedule) {
    const weekStart = new Date(week.weekStart)
    const weekEnd = new Date(week.weekEnd)

    if (targetDate >= weekStart && targetDate <= weekEnd) {
      return week
    }
  }

  return null
}

/**
 * Format week range for display
 * @param {string} weekStart - ISO date string (YYYY-MM-DD)
 * @param {string} weekEnd - ISO date string (YYYY-MM-DD)
 * @param {string} locale - Locale for formatting (default: 'de-DE')
 * @returns {string} - Formatted week range (e.g., "1. Dez - 7. Dez")
 */
export const formatWeekRange = (weekStart, weekEnd, locale = 'de-DE') => {
  const start = new Date(weekStart)
  const end = new Date(weekEnd)

  const options = { day: 'numeric', month: 'short' }
  const startStr = start.toLocaleDateString(locale, options)
  const endStr = end.toLocaleDateString(locale, options)

  return `${startStr} - ${endStr}`
}

// Export combined schedules for direct access if needed
export { weeklyReadingSchedule2026, weeklyReadingSchedule2023, weeklyReadingSchedule2025, weeklyReadingSchedule2024 }

export default {
  getScheduleForYear,
  getAvailableYears,
  isYearAvailable,
  getCurrentWeekReading,
  getReadingByDate,
  formatWeekRange
}
