# Phase 4: Integration & Polish

## Overview

This final phase wires everything together: data fetching, state management, loading states, error handling, and final polish to match the POC exactly.

## Prerequisites

- Phase 1, 2, and 3 completed
- API endpoints working
- All components created

## Tasks

### 4.1 Install SWR for Data Fetching

SWR provides caching, revalidation, and error handling out of the box.

```bash
npm install swr
```

### 4.2 Create Data Fetching Hooks

```typescript
// src/hooks/use-report.ts
'use client'

import useSWR from 'swr'
import type { ReportData, WeeksResponse, VendorData } from '@/types'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useReport(weekStart?: string) {
  const url = weekStart
    ? `/api/report?week_start=${weekStart}`
    : '/api/report'

  return useSWR<ReportData>(url, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 60000, // 1 minute
  })
}

export function useVendor(vendorId: string | null, weekStart?: string) {
  const url = vendorId
    ? weekStart
      ? `/api/vendors/${vendorId}?week_start=${weekStart}`
      : `/api/vendors/${vendorId}`
    : null

  return useSWR<VendorData>(url, fetcher, {
    revalidateOnFocus: false,
  })
}

export function useWeeks(year: number, month: number) {
  return useSWR<WeeksResponse>(
    `/api/weeks?year=${year}&month=${month}`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 86400000, // 24 hours - weeks don't change
    }
  )
}
```

### 4.3 Create App State Context

```typescript
// src/context/app-context.tsx
'use client'

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { format, subDays, startOfMonth } from 'date-fns'
import { getMondayOfWeek, formatDateString } from '@/lib/utils'
import type { VendorData, TimelineMilestone } from '@/types'

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
```

### 4.4 Create Loading Skeletons

```typescript
// src/components/skeletons.tsx
export function VendorTabsSkeleton() {
  return (
    <div className="flex gap-3 mb-10 flex-wrap">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="bg-bg-card border border-border-color px-5 py-3.5 rounded-md
                     min-w-[200px] animate-pulse"
        >
          <div className="h-4 bg-bg-card-hover rounded w-32 mb-2" />
          <div className="h-3 bg-bg-card-hover rounded w-20" />
        </div>
      ))}
    </div>
  )
}

export function TimelineSkeleton() {
  return (
    <div className="bg-bg-card border border-border-color rounded-lg p-8">
      <div className="flex justify-between gap-4 min-w-[1000px]">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex flex-col items-center w-[130px] animate-pulse">
            <div className="h-5 bg-bg-card-hover rounded w-16 mb-3" />
            <div className="w-6 h-6 bg-bg-card-hover rounded-full mb-2" />
            <div className="w-0.5 h-6 bg-bg-card-hover my-2" />
            <div className="w-full bg-bg-card-hover rounded h-24" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function StatusCardSkeleton() {
  return (
    <div className="bg-bg-card border border-border-color rounded-lg p-6 animate-pulse">
      <div className="h-5 bg-bg-card-hover rounded w-40 mb-4" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-5 h-5 bg-bg-card-hover rounded-full" />
            <div className="h-4 bg-bg-card-hover rounded flex-1" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function RaidLogSkeleton() {
  return (
    <div className="bg-bg-card border border-border-color rounded-lg p-6 animate-pulse">
      <div className="h-5 bg-bg-card-hover rounded w-48 mb-4" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="grid grid-cols-6 gap-4">
            <div className="h-6 bg-bg-card-hover rounded" />
            <div className="h-6 bg-bg-card-hover rounded" />
            <div className="h-6 bg-bg-card-hover rounded col-span-2" />
            <div className="h-6 bg-bg-card-hover rounded" />
            <div className="h-6 bg-bg-card-hover rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function ResourcesSkeleton() {
  return (
    <div className="bg-bg-card border border-border-color rounded-lg p-6 animate-pulse">
      <div className="h-5 bg-bg-card-hover rounded w-40 mb-4" />
      <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3.5 bg-bg-secondary rounded-md">
            <div className="w-9 h-9 bg-bg-card-hover rounded-lg" />
            <div className="flex-1">
              <div className="h-4 bg-bg-card-hover rounded w-32 mb-1" />
              <div className="h-3 bg-bg-card-hover rounded w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### 4.5 Create Error Component

```typescript
// src/components/error-state.tsx
interface ErrorStateProps {
  message?: string
  onRetry?: () => void
}

export function ErrorState({ message = 'Something went wrong', onRetry }: ErrorStateProps) {
  return (
    <div className="bg-bg-card border border-rag-red/30 rounded-lg p-8 text-center">
      <div className="text-4xl mb-4">⚠️</div>
      <h3 className="text-lg font-semibold text-text-primary mb-2">Error</h3>
      <p className="text-sm text-text-secondary mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-accent-cyan text-bg-primary px-4 py-2 rounded-md
                     text-sm font-medium transition-all duration-200
                     hover:opacity-90"
        >
          Try Again
        </button>
      )}
    </div>
  )
}
```

### 4.6 Create Main Report Page Component

```typescript
// src/components/report-page.tsx
'use client'

import { useEffect } from 'react'
import { useAppState } from '@/context/app-context'
import { useReport, useWeeks } from '@/hooks/use-report'
import {
  Header,
  VendorTabs,
  WeekNavigation,
  DeliveryTimeline,
  WeeklyStatus,
  RaidLog,
  Resources,
  MilestoneModal,
  Section,
} from '@/components'
import {
  VendorTabsSkeleton,
  TimelineSkeleton,
  StatusCardSkeleton,
  RaidLogSkeleton,
  ResourcesSkeleton,
} from '@/components/skeletons'
import { ErrorState } from '@/components/error-state'

export function ReportPage() {
  const {
    currentVendorId,
    setCurrentVendorId,
    selectedWeekStart,
    setSelectedWeekStart,
    currentMonth,
    monthLabel,
    goToPrevMonth,
    goToNextMonth,
    applyQuickFilter,
    activeQuickFilter,
    isModalOpen,
    selectedMilestone,
    openMilestoneModal,
    closeMilestoneModal,
  } = useAppState()

  // Fetch report data
  const {
    data: reportData,
    error: reportError,
    isLoading: reportLoading,
    mutate: refetchReport,
  } = useReport(selectedWeekStart)

  // Fetch weeks for current month
  const {
    data: weeksData,
    error: weeksError,
  } = useWeeks(currentMonth.getFullYear(), currentMonth.getMonth() + 1)

  // Set initial vendor when data loads
  useEffect(() => {
    if (reportData?.vendors && reportData.vendors.length > 0 && !currentVendorId) {
      setCurrentVendorId(reportData.vendors[0].id)
    }
  }, [reportData, currentVendorId, setCurrentVendorId])

  // Find current vendor data
  const currentVendor = reportData?.vendors.find((v) => v.id === currentVendorId)

  // Handle errors
  if (reportError) {
    return (
      <div className="min-h-screen bg-bg-primary">
        <Header reportDate="Error loading report" />
        <main className="max-w-[1400px] mx-auto p-8">
          <ErrorState
            message="Failed to load report data. Please try again."
            onRetry={() => refetchReport()}
          />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <Header reportDate={reportData?.reportDate ?? 'Loading...'} />

      <main className="max-w-[1400px] mx-auto px-10 py-8">
        {/* Vendor Tabs */}
        {reportLoading ? (
          <VendorTabsSkeleton />
        ) : (
          <VendorTabs
            vendors={reportData?.vendors.map((v) => ({
              id: v.id,
              name: v.name,
              owner: v.owner,
              ragStatus: v.ragStatus,
            })) ?? []}
            currentVendorId={currentVendorId}
            onVendorSelect={setCurrentVendorId}
          />
        )}

        {/* Content Wrapper */}
        <div className="transition-opacity duration-200">
          {/* Delivery Timeline Section */}
          <Section
            title="Delivery Timeline"
            headerContent={
              weeksData && (
                <WeekNavigation
                  monthLabel={monthLabel}
                  weeks={weeksData.weeks}
                  selectedWeek={selectedWeekStart}
                  onPrevMonth={goToPrevMonth}
                  onNextMonth={goToNextMonth}
                  onWeekSelect={setSelectedWeekStart}
                  onQuickFilter={applyQuickFilter}
                  activeQuickFilter={activeQuickFilter}
                />
              )
            }
          >
            {reportLoading || !currentVendor ? (
              <TimelineSkeleton />
            ) : (
              <DeliveryTimeline
                timeline={currentVendor.timeline}
                onMilestoneClick={openMilestoneModal}
              />
            )}
          </Section>

          {/* Weekly Status Section */}
          <Section title="Weekly Status" delay={0.1}>
            {reportLoading || !currentVendor ? (
              <div className="grid grid-cols-2 gap-5 md:grid-cols-1">
                <StatusCardSkeleton />
                <StatusCardSkeleton />
              </div>
            ) : (
              <WeeklyStatus
                achievements={currentVendor.achievements}
                focus={currentVendor.focus}
              />
            )}
          </Section>

          {/* RAID Log Section */}
          <Section title="RAID Log" delay={0.2}>
            {reportLoading || !currentVendor ? (
              <RaidLogSkeleton />
            ) : (
              <RaidLog items={currentVendor.raid} />
            )}
          </Section>

          {/* Resources Section */}
          <Section title="Resources" delay={0.3}>
            {reportLoading || !currentVendor ? (
              <ResourcesSkeleton />
            ) : (
              <Resources resources={currentVendor.resources} />
            )}
          </Section>
        </div>
      </main>

      {/* Milestone Modal */}
      <MilestoneModal
        milestone={selectedMilestone}
        isOpen={isModalOpen}
        onClose={closeMilestoneModal}
      />
    </div>
  )
}
```

### 4.7 Update Root Layout

```typescript
// src/app/layout.tsx
import type { Metadata } from 'next'
import { AppProvider } from '@/context/app-context'
import './globals.css'

export const metadata: Metadata = {
  title: 'Delivery Weekly Report',
  description: 'Weekly delivery status report viewer',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  )
}
```

### 4.8 Update Main Page

```typescript
// src/app/page.tsx
import { ReportPage } from '@/components/report-page'

export default function Home() {
  return <ReportPage />
}
```

### 4.9 Add CSS for Responsive Breakpoints

Add these responsive utilities to `globals.css`:

```css
/* Add to globals.css */

/* Responsive utilities */
@media (max-width: 1024px) {
  .lg\:grid-cols-1 {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .md\:grid-cols-1 {
    grid-template-columns: 1fr;
  }
}

/* Vendor switching animation */
.content-wrapper.loading {
  opacity: 0;
}

/* Ensure smooth scrolling for timeline */
.timeline-container {
  scrollbar-width: thin;
  scrollbar-color: var(--timeline-line) var(--bg-card);
}

.timeline-container::-webkit-scrollbar {
  height: 8px;
}

.timeline-container::-webkit-scrollbar-track {
  background: var(--bg-card);
  border-radius: 4px;
}

.timeline-container::-webkit-scrollbar-thumb {
  background: var(--timeline-line);
  border-radius: 4px;
}

.timeline-container::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}
```

### 4.10 Create Hooks Index

```typescript
// src/hooks/index.ts
export { useReport, useVendor, useWeeks } from './use-report'
```

### 4.11 Final Docker Verification

1. **Build the production image:**
   ```bash
   docker build -t weekly-report-viewer .
   ```

2. **Run with database connection:**
   ```bash
   docker run -p 3001:3001 \
     -e DATABASE_URL="postgresql://user:pass@host.docker.internal:5432/vendor_manager" \
     weekly-report-viewer
   ```

3. **Or use docker-compose:**
   ```bash
   docker-compose up --build
   ```

### 4.12 Integration with Vendor Manager Docker Network

If the vendor manager uses a Docker network, update docker-compose.yml:

```yaml
# docker-compose.yml
version: '3.8'

services:
  weekly-report-viewer:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: weekly-report-viewer
    ports:
      - "3001:3001"
    environment:
      # Use the database service name from vendor-manager's docker-compose
      - DATABASE_URL=postgresql://postgres:postgres@vendor-manager-db:5432/vendor_manager
    restart: unless-stopped
    networks:
      - vendor-manager_default

networks:
  vendor-manager_default:
    external: true
```

## Verification Steps

1. **Start development server:**
   ```bash
   npm run dev
   ```

2. **Verify functionality:**
   - [ ] Page loads with loading skeletons
   - [ ] Vendor tabs appear and are clickable
   - [ ] Switching vendors updates all content sections
   - [ ] Week navigation dropdown works
   - [ ] Month navigation (prev/next) works
   - [ ] Quick filter buttons work
   - [ ] Timeline milestones are clickable
   - [ ] Milestone modal opens with correct data
   - [ ] Modal closes on Escape key and backdrop click
   - [ ] RAID log filters work
   - [ ] Resource links open in new tabs
   - [ ] Error state shows on API failure
   - [ ] Loading states appear during data fetch

3. **Compare with POC:**
   - Open POC and production app side by side
   - Verify visual parity for all sections
   - Test all interactions match

4. **Test Docker deployment:**
   ```bash
   docker-compose up --build
   # Open http://localhost:3001
   ```

## Files Created

```
src/
├── hooks/
│   ├── use-report.ts
│   └── index.ts
├── context/
│   └── app-context.tsx
├── components/
│   ├── skeletons.tsx
│   ├── error-state.tsx
│   ├── report-page.tsx
│   └── (updated index.ts)
└── app/
    ├── layout.tsx (updated)
    └── page.tsx (updated)
```

## Success Criteria

- [ ] Application loads without errors
- [ ] All data fetches correctly from API
- [ ] Loading states display properly
- [ ] Error handling works for API failures
- [ ] Vendor switching works seamlessly
- [ ] Week navigation works with data refresh
- [ ] All animations match POC timing
- [ ] Visual design matches POC exactly
- [ ] Docker container runs successfully
- [ ] No TypeScript or ESLint errors
- [ ] Responsive layout works on tablets

## Post-Implementation Tasks

After completing all phases:

1. **Documentation:**
   - Update README.md with setup instructions
   - Document environment variables

2. **Testing (Optional):**
   - Add Playwright E2E tests
   - Test critical user flows

3. **Monitoring (Optional):**
   - Add error tracking (Sentry)
   - Add request logging

4. **Performance (Optional):**
   - Add response caching headers
   - Optimize bundle size

## Troubleshooting

### "Cannot read property of undefined"
- Check API responses in Network tab
- Verify data structure matches types
- Add null checks in components

### Styles don't match POC
- Compare CSS variables are correctly set
- Check Tailwind purge isn't removing classes
- Verify font-family is applied

### Docker container can't connect to database
- Verify network configuration
- Check DATABASE_URL format
- Test connection from container shell

### Week navigation not updating data
- Verify SWR key changes with week parameter
- Check API accepts week_start parameter
- Clear SWR cache if needed

## Project Complete! 🎉

After completing all four phases, you will have a fully functional, read-only weekly report viewer that:

- Connects to the existing vendor manager database
- Renders exactly like the POC
- Runs in Docker alongside the vendor manager
- Supports week-by-week navigation
- Displays vendor-specific data dynamically
