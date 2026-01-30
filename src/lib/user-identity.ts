/**
 * User Identity Management via localStorage
 *
 * Provides anonymous user identification without authentication.
 * Each browser gets a unique UUID stored in localStorage.
 *
 * Future-proof: Can be replaced with real auth by changing getUserId()
 * to fetch from auth session instead of localStorage.
 */

const USER_ID_KEY = 'weekly_report_user_id'
const USER_NAME_KEY = 'weekly_report_user_name'

/**
 * Generate a simple UUID v4
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Get the current user's unique ID.
 * Creates and stores a new UUID if none exists.
 *
 * @returns {string} The user's unique identifier
 */
export function getUserId(): string {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return 'ssr-temp-id' // Temporary ID for SSR, will be replaced on client
  }

  try {
    // Try to get existing user ID from localStorage
    let userId = localStorage.getItem(USER_ID_KEY)

    // If no ID exists, generate and store a new one
    if (!userId) {
      userId = generateUUID()
      localStorage.setItem(USER_ID_KEY, userId)
      console.log('🆔 Generated new user ID:', userId)
    }

    return userId
  } catch (error) {
    // Fallback if localStorage is not available (privacy mode, etc.)
    console.warn('localStorage not available, using session-only ID')
    return `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}

/**
 * Get the stored user name (if previously saved)
 *
 * @returns {string | null} The stored user name or null
 */
export function getUserName(): string | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    return localStorage.getItem(USER_NAME_KEY)
  } catch (error) {
    return null
  }
}

/**
 * Store the user's name for future convenience
 *
 * @param {string} name - The user's name to store
 */
export function setUserName(name: string): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.setItem(USER_NAME_KEY, name)
  } catch (error) {
    console.warn('Failed to store user name:', error)
  }
}

/**
 * Clear all user identity data (for testing/debugging)
 */
export function clearUserIdentity(): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.removeItem(USER_ID_KEY)
    localStorage.removeItem(USER_NAME_KEY)
    console.log('🗑️ User identity cleared')
  } catch (error) {
    console.warn('Failed to clear user identity:', error)
  }
}

/**
 * Check if the current user is the owner of a feedback item
 *
 * @param {string} feedbackUserId - The user ID from the feedback
 * @returns {boolean} True if current user owns this feedback
 */
export function isCurrentUser(feedbackUserId: string): boolean {
  return getUserId() === feedbackUserId
}
