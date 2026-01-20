'use client'

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { format, subDays, startOfMonth } from 'date-fns'
import { getMondayOfWeek, formatDateString } from '@/lib/utils'
import type { TimelineMilestone } from '@/types'

interface AppState {
  // Selected vendor
  currentVendorId: string | null
  setCurrentVendorId: (id: string) => void

  // Week navigation
  selectedWeekStart: string
  currentMonth: Date
  setSelectedWeekStart: (weekStart: string) => void
  setCurrentMonth: (date: Date) => void

  // Quick filters
  activeQuickFilter: string | null

  // Navigation actions
  goToPrevMonth: () => void
  goToNextMonth: () => void
  applyQuickFilter: (type: 'last' | '2weeks' | 'month-start') => void

  // Modal state
  isModalOpen: boolean
  selectedMilestone: TimelineMilestone | null
  openMilestoneModal: (milestone: TimelineMilestone) => void
  closeMilestoneModal: () => void

  // Month label
  monthLabel: string
}

const AppContext = createContext<AppState | null>(null)

interface AppProviderProps {
  children: ReactNode
}

export function AppProvider({ children }: AppProviderProps) {
  // Initialize with current week
  const today = new Date()
  const initialMonday = getMondayOfWeek(today)

  const [currentVendorId, setCurrentVendorId] = useState<string | null>(null)
  const [selectedWeekStart, setSelectedWeekStart] = useState(formatDateString(initialMonday))
  const [currentMonth, setCurrentMonth] = useState(
    startOfMonth(initialMonday)
  )
  const [activeQuickFilter, setActiveQuickFilter] = useState<string | null>(null)

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedMilestone, setSelectedMilestone] = useState<TimelineMilestone | null>(null)

  // Month label
  const monthLabel = format(currentMonth, 'MMMM yyyy')

  // Navigation actions
  const goToPrevMonth = useCallback(() => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev)
      newMonth.setMonth(newMonth.getMonth() - 1)
      return newMonth
    })
    setActiveQuickFilter(null)
  }, [])

  const goToNextMonth = useCallback(() => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev)
      newMonth.setMonth(newMonth.getMonth() + 1)
      return newMonth
    })
    setActiveQuickFilter(null)
  }, [])

  const applyQuickFilter = useCallback((type: 'last' | '2weeks' | 'month-start') => {
    let targetDate: Date

    switch (type) {
      case 'last':
        targetDate = subDays(today, 7)
        break
      case '2weeks':
        targetDate = subDays(today, 14)
        break
      case 'month-start':
        targetDate = startOfMonth(today)
        break
    }

    const targetMonday = getMondayOfWeek(targetDate)
    setCurrentMonth(startOfMonth(targetMonday))
    setSelectedWeekStart(formatDateString(targetMonday))
    setActiveQuickFilter(type)
  }, [])

  // Update quick filter highlight when week changes
  useEffect(() => {
    const checkQuickFilter = () => {
      const selected = new Date(selectedWeekStart)
      const lastWeek = getMondayOfWeek(subDays(today, 7))
      const twoWeeks = getMondayOfWeek(subDays(today, 14))
      const monthStart = getMondayOfWeek(startOfMonth(today))

      if (formatDateString(selected) === formatDateString(lastWeek)) {
        setActiveQuickFilter('last')
      } else if (formatDateString(selected) === formatDateString(twoWeeks)) {
        setActiveQuickFilter('2weeks')
      } else if (formatDateString(selected) === formatDateString(monthStart)) {
        setActiveQuickFilter('month-start')
      } else {
        setActiveQuickFilter(null)
      }
    }
    checkQuickFilter()
  }, [selectedWeekStart])

  // Modal actions
  const openMilestoneModal = useCallback((milestone: TimelineMilestone) => {
    setSelectedMilestone(milestone)
    setIsModalOpen(true)
  }, [])

  const closeMilestoneModal = useCallback(() => {
    setIsModalOpen(false)
    // Delay clearing milestone to allow animation
    setTimeout(() => setSelectedMilestone(null), 300)
  }, [])

  const value: AppState = {
    currentVendorId,
    setCurrentVendorId,
    selectedWeekStart,
    currentMonth,
    setSelectedWeekStart,
    setCurrentMonth,
    activeQuickFilter,
    goToPrevMonth,
    goToNextMonth,
    applyQuickFilter,
    isModalOpen,
    selectedMilestone,
    openMilestoneModal,
    closeMilestoneModal,
    monthLabel,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppState() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppState must be used within AppProvider')
  }
  return context
}
