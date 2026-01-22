'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import type { TimelineMilestone, TimelineStatus } from '@/types'

interface DeliveryTimelineProps {
  timeline: TimelineMilestone[]
  onMilestoneClick: (milestone: TimelineMilestone) => void
}

export function DeliveryTimeline({ timeline, onMilestoneClick }: DeliveryTimelineProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  // Check scroll position and update fade indicators
  const updateScrollIndicators = useCallback(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const { scrollLeft, scrollWidth, clientWidth } = container
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
  }, [])

  // Initialize and listen for scroll/resize
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    updateScrollIndicators()
    container.addEventListener('scroll', updateScrollIndicators)
    window.addEventListener('resize', updateScrollIndicators)

    return () => {
      container.removeEventListener('scroll', updateScrollIndicators)
      window.removeEventListener('resize', updateScrollIndicators)
    }
  }, [updateScrollIndicators, timeline])

  // Calculate progress percentage
  const completedCount = timeline.filter((m) => m.status === 'completed').length
  const progress = Math.max(5, (completedCount / timeline.length) * 100)

  // Find current (first non-completed) milestone index
  const currentIndex = timeline.findIndex((m) => m.status !== 'completed')

  return (
    <div className="bg-bg-card border border-border-color rounded-lg p-8 relative">
      {/* Left fade indicator */}
      <div
        className={cn(
          'absolute left-0 top-0 bottom-0 w-16 pointer-events-none z-10 rounded-l-lg',
          'bg-gradient-to-r from-bg-card to-transparent',
          'transition-opacity duration-300',
          canScrollLeft ? 'opacity-100' : 'opacity-0'
        )}
      />

      {/* Right fade indicator */}
      <div
        className={cn(
          'absolute right-0 top-0 bottom-0 w-16 pointer-events-none z-10 rounded-r-lg',
          'bg-gradient-to-l from-bg-card to-transparent',
          'transition-opacity duration-300',
          canScrollRight ? 'opacity-100' : 'opacity-0'
        )}
      />

      {/* Scrollable container with custom scrollbar */}
      <div
        ref={scrollContainerRef}
        className="timeline-scroll-container overflow-x-auto"
      >
        <div className="relative px-10 pb-4">
        {/* Timeline Track */}
        <div className="absolute top-11 left-10 right-10 h-[3px] bg-timeline-line rounded-sm">
          <div
            className="absolute top-0 left-0 h-full bg-rag-green rounded-sm animate-[trackFill_1s_ease_forwards_0.3s]"
            style={{ '--progress': `${progress}%` } as React.CSSProperties}
          />
        </div>

        {/* Timeline Nodes */}
        <div
          className="flex justify-between relative"
          style={{ minWidth: `${Math.max(timeline.length * 160, 1000)}px` }}
        >
          {timeline.map((milestone, index) => (
            <TimelineNode
              key={milestone.id}
              milestone={milestone}
              isCurrent={index === currentIndex}
              delay={index * 0.08}
              onClick={() => onMilestoneClick(milestone)}
            />
          ))}
        </div>
        </div>
      </div>
    </div>
  )
}

interface TimelineNodeProps {
  milestone: TimelineMilestone
  isCurrent: boolean
  delay: number
  onClick: () => void
}

function TimelineNode({ milestone, isCurrent, delay, onClick }: TimelineNodeProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'flex flex-col items-center cursor-pointer transition-all duration-200 w-[130px]',
        'opacity-0 animate-[nodeAppear_0.5s_ease_forwards]',
        isCurrent && 'current'
      )}
      style={{ animationDelay: `${delay}s` }}
    >
      {/* Date */}
      <div className="text-[13px] font-semibold text-text-primary mb-3 h-5">
        {milestone.date}
      </div>

      {/* Circle */}
      <NodeCircle status={milestone.status} />

      {/* Connector Line */}
      <div className="w-0.5 h-6 bg-timeline-line my-2" />

      {/* Connector Dot */}
      <div className="w-1.5 h-1.5 rounded-full bg-timeline-line mb-2" />

      {/* Card */}
      <div
        className={cn(
          'bg-transparent border border-border-color rounded-sm p-3 text-left w-full',
          'transition-all duration-200',
          'hover:border-accent-cyan hover:-translate-y-1',
          isCurrent && 'border-rag-green bg-rag-green/[0.08] hover:border-rag-green'
        )}
      >
        <div className={cn(
          'text-[11px] font-semibold underline mb-1',
          isCurrent ? 'text-rag-green' : 'text-accent-cyan'
        )}>
          Prod Release
        </div>
        <div className="text-[11px] text-text-secondary leading-snug">
          {milestone.title}
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {milestone.platforms.slice(0, 3).map((platform) => (
            <span
              key={platform}
              title={platform}
              className="bg-bg-secondary border border-border-color px-1.5 py-0.5 rounded
                         text-[9px] text-text-secondary whitespace-nowrap overflow-hidden
                         text-ellipsis max-w-full"
            >
              {platform}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

interface NodeCircleProps {
  status: TimelineStatus
}

function NodeCircle({ status }: NodeCircleProps) {
  const statusStyles: Record<TimelineStatus, string> = {
    completed: 'bg-rag-green shadow-[0_0_0_3px_var(--rag-green)]',
    in_progress: 'bg-rag-amber shadow-[0_0_0_3px_var(--rag-amber)]',
    upcoming: 'bg-bg-card border-4 border-rag-green shadow-none',
    tbc: 'bg-bg-card border-[3px] border-timeline-line shadow-none',
  }

  return (
    <div
      className={cn(
        'w-6 h-6 rounded-full border-4 border-bg-card relative z-[2]',
        'transition-all duration-200 hover:scale-[1.15]',
        statusStyles[status]
      )}
    />
  )
}
