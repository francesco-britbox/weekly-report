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
  } = useWeeks(currentMonth.getFullYear(), currentMonth.getMonth() + 1)

  // Set initial vendor when data loads
  useEffect(() => {
    if (reportData?.vendors && reportData.vendors.length > 0 && !currentVendorId) {
      setCurrentVendorId(reportData.vendors[0].id)
    }
  }, [reportData, currentVendorId, setCurrentVendorId])

  // Find current vendor data
  const currentVendor = reportData?.vendors?.find((v) => v.id === currentVendorId)

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
