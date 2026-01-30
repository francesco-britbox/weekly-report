// RAG Status type
export type RAGStatus = 'green' | 'amber' | 'red'

// Timeline milestone status
export type TimelineStatus = 'completed' | 'in_progress' | 'upcoming' | 'tbc'

// Achievement status
export type AchievementStatus = 'done' | 'in_progress' | null

// RAID item type
export type RaidType = 'risk' | 'issue' | 'dependency'

// Impact level
export type ImpactLevel = 'high' | 'medium' | 'low'

// Resource type
export type ResourceType = 'confluence' | 'jira' | 'github' | 'docs'

// Achievement item
export interface Achievement {
  id: string
  description: string
  status: AchievementStatus
  sortOrder: number
}

// Focus item
export interface FocusItem {
  id: string
  description: string
  sortOrder: number
}

// Timeline milestone
export interface TimelineMilestone {
  id: string
  date: string
  title: string
  status: TimelineStatus
  platforms: string[]
  features: string[]
  sortOrder: number
}

// RAID log item
export interface RaidItem {
  id: string
  type: RaidType
  area: string
  description: string
  impact: ImpactLevel
  owner: string | null
  ragStatus: RAGStatus
  sortOrder: number
}

// Resource item
export interface ResourceItem {
  id: string
  type: ResourceType
  name: string
  description: string | null
  url: string
  sortOrder: number
}

// Vendor for the list view
export interface VendorSummary {
  id: string
  name: string
  owner: string | null
  ragStatus: RAGStatus | null
}

// Full vendor data
export interface VendorData {
  id: string
  name: string
  owner: string | null
  ragStatus: RAGStatus | null
  timeline: TimelineMilestone[]
  achievements: Achievement[]
  focus: FocusItem[]
  raid: RaidItem[]
  resources: ResourceItem[]
}

// Full report data
export interface ReportData {
  reportDate: string
  weekStart: string
  generatedAt: string
  vendors: VendorData[]
}

// Week navigation
export interface WeekOption {
  weekStart: string
  label: string
}

export interface WeeksResponse {
  year: number
  month: number
  weeks: WeekOption[]
}

// Feedback item
export interface Feedback {
  id: string
  vendorId: string
  weekStart: string
  userId: string
  userName: string
  feedbackHtml: string
  createdAt: string
  updatedAt: string
}

// API response for feedback (now returns array of all feedback for vendor+week)
export interface FeedbackResponse {
  feedback: Feedback[]
}
