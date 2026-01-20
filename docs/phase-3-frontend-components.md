# Phase 3: Frontend Components

## Overview

This phase builds all React components to match the POC exactly. Each component is designed to be self-contained and reusable.

## Prerequisites

- Phase 1 and Phase 2 completed
- API endpoints working and returning data

## Component Hierarchy

```
page.tsx
├── Header
│   ├── Logo (Image)
│   └── HeaderInfo (title + date)
├── VendorTabs
│   └── VendorTab[] (clickable cards with RAG indicator)
└── ContentWrapper
    ├── DeliveryTimeline
    │   ├── WeekNavigation
    │   │   ├── MonthNav (prev/next buttons + label)
    │   │   ├── WeekSelect (dropdown)
    │   │   └── QuickFilters (buttons)
    │   └── TimelineTrack
    │       └── TimelineNode[] (date, circle, connector, card)
    ├── WeeklyStatus
    │   ├── StatusCard (Achievements)
    │   │   └── StatusItem[]
    │   └── StatusCard (Focus)
    │       └── StatusItem[]
    ├── RaidLog
    │   ├── RaidHeader (title + filters)
    │   └── RaidTable
    │       └── RaidRow[]
    └── Resources
        └── ResourceGrid
            └── ResourceItem[]

MilestoneModal (Portal)
├── ModalOverlay
└── ModalContent
    ├── ModalHeader
    ├── ModalPlatforms
    └── ModalFeatures
```

## Tasks

### 3.1 Create Header Component

```typescript
// src/components/header.tsx
import Image from 'next/image'

interface HeaderProps {
  reportDate: string
}

export function Header({ reportDate }: HeaderProps) {
  return (
    <header className="bg-bg-secondary border-b border-border-color px-10 py-4 sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto flex justify-between items-center">
        <Image
          src="/images/logo.png"
          alt="Logo"
          width={112}
          height={28}
          className="h-7 w-auto"
          priority
        />
        <div className="flex items-center gap-6">
          <span className="text-sm font-medium text-text-secondary">
            Delivery Weekly Report
          </span>
          <span className="text-sm font-semibold text-accent-cyan">
            {reportDate}
          </span>
        </div>
      </div>
    </header>
  )
}
```

### 3.2 Create VendorTabs Component

```typescript
// src/components/vendor-tabs.tsx
import { cn } from '@/lib/utils'
import type { VendorSummary, RAGStatus } from '@/types'

interface VendorTabsProps {
  vendors: VendorSummary[]
  currentVendorId: string | null
  onVendorSelect: (vendorId: string) => void
}

export function VendorTabs({ vendors, currentVendorId, onVendorSelect }: VendorTabsProps) {
  return (
    <div className="flex gap-3 mb-10 flex-wrap">
      {vendors.map((vendor) => (
        <VendorTab
          key={vendor.id}
          vendor={vendor}
          isActive={vendor.id === currentVendorId}
          onClick={() => onVendorSelect(vendor.id)}
        />
      ))}
    </div>
  )
}

interface VendorTabProps {
  vendor: VendorSummary
  isActive: boolean
  onClick: () => void
}

function VendorTab({ vendor, isActive, onClick }: VendorTabProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'bg-bg-card border border-border-color px-5 py-3.5 rounded-md cursor-pointer',
        'flex items-center gap-3.5 min-w-[200px] transition-all duration-200',
        'hover:bg-bg-card-hover hover:border-accent-cyan-dim hover:-translate-y-0.5',
        isActive && 'bg-accent-cyan border-accent-cyan text-bg-primary'
      )}
    >
      <div className="text-left flex-1">
        <div className="font-semibold text-sm tracking-tight">
          {vendor.name}
        </div>
        <div className={cn(
          'text-xs mt-0.5',
          isActive ? 'text-bg-primary/70' : 'text-text-secondary'
        )}>
          {vendor.owner ?? 'No owner assigned'}
        </div>
      </div>
      <RagIndicator status={vendor.ragStatus} />
    </button>
  )
}

interface RagIndicatorProps {
  status: RAGStatus | null
}

function RagIndicator({ status }: RagIndicatorProps) {
  const colorClass = {
    green: 'bg-rag-green shadow-[0_0_8px_var(--rag-green)]',
    amber: 'bg-rag-amber shadow-[0_0_8px_var(--rag-amber)]',
    red: 'bg-rag-red shadow-[0_0_8px_var(--rag-red)]',
  }[status ?? 'green']

  return (
    <div className={cn('w-3 h-3 rounded-full flex-shrink-0', colorClass)} />
  )
}
```

### 3.3 Create WeekNavigation Component

```typescript
// src/components/week-navigation.tsx
'use client'

import { cn } from '@/lib/utils'
import type { WeekOption } from '@/types'

interface WeekNavigationProps {
  monthLabel: string
  weeks: WeekOption[]
  selectedWeek: string
  onPrevMonth: () => void
  onNextMonth: () => void
  onWeekSelect: (weekStart: string) => void
  onQuickFilter: (type: 'last' | '2weeks' | 'month-start') => void
  activeQuickFilter: string | null
}

export function WeekNavigation({
  monthLabel,
  weeks,
  selectedWeek,
  onPrevMonth,
  onNextMonth,
  onWeekSelect,
  onQuickFilter,
  activeQuickFilter,
}: WeekNavigationProps) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Month Navigation */}
      <div className="flex items-center gap-1">
        <button
          onClick={onPrevMonth}
          className="bg-bg-card border border-border-color w-7 h-7 rounded-md
                     cursor-pointer text-text-secondary text-sm flex items-center justify-center
                     transition-all duration-200 hover:bg-bg-card-hover hover:border-accent-cyan hover:text-accent-cyan"
          title="Previous Month"
        >
          ‹
        </button>
        <span className="text-xs font-medium text-text-secondary min-w-20 text-center">
          {monthLabel}
        </span>
        <button
          onClick={onNextMonth}
          className="bg-bg-card border border-border-color w-7 h-7 rounded-md
                     cursor-pointer text-text-secondary text-sm flex items-center justify-center
                     transition-all duration-200 hover:bg-bg-card-hover hover:border-accent-cyan hover:text-accent-cyan"
          title="Next Month"
        >
          ›
        </button>
      </div>

      {/* Week Select Dropdown */}
      <select
        value={selectedWeek}
        onChange={(e) => onWeekSelect(e.target.value)}
        className="bg-bg-card border border-border-color rounded-md px-3 py-1.5 pr-8 text-xs
                   text-text-primary cursor-pointer appearance-none
                   bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20width%3D%2712%27%20height%3D%2712%27%20viewBox%3D%270%200%2024%2024%27%20fill%3D%27none%27%20stroke%3D%27%238ba3b8%27%20stroke-width%3D%272%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27%3E%3Cpolyline%20points%3D%276%209%2012%2015%2018%209%27%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')]
                   bg-no-repeat bg-[right_10px_center]
                   transition-all duration-200 hover:border-accent-cyan
                   focus:outline-none focus:border-accent-cyan focus:shadow-[0_0_0_2px_var(--accent-cyan-dim)]"
      >
        {weeks.map((week) => (
          <option key={week.weekStart} value={week.weekStart} className="bg-bg-secondary">
            {week.label}
          </option>
        ))}
      </select>

      {/* Quick Filters */}
      <div className="flex gap-1.5">
        <QuickFilterButton
          label="Last week"
          isActive={activeQuickFilter === 'last'}
          onClick={() => onQuickFilter('last')}
        />
        <QuickFilterButton
          label="2 weeks ago"
          isActive={activeQuickFilter === '2weeks'}
          onClick={() => onQuickFilter('2weeks')}
        />
        <QuickFilterButton
          label="Start of month"
          isActive={activeQuickFilter === 'month-start'}
          onClick={() => onQuickFilter('month-start')}
        />
      </div>
    </div>
  )
}

interface QuickFilterButtonProps {
  label: string
  isActive: boolean
  onClick: () => void
}

function QuickFilterButton({ label, isActive, onClick }: QuickFilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'border px-2.5 py-1.5 rounded-full text-[10px] font-medium cursor-pointer',
        'transition-all duration-200 whitespace-nowrap',
        isActive
          ? 'bg-accent-cyan border-accent-cyan text-bg-primary'
          : 'bg-transparent border-border-color text-text-secondary hover:border-accent-cyan hover:text-accent-cyan'
      )}
    >
      {label}
    </button>
  )
}
```

### 3.4 Create DeliveryTimeline Component

```typescript
// src/components/delivery-timeline.tsx
'use client'

import { cn } from '@/lib/utils'
import type { TimelineMilestone, TimelineStatus } from '@/types'

interface DeliveryTimelineProps {
  timeline: TimelineMilestone[]
  onMilestoneClick: (milestone: TimelineMilestone) => void
}

export function DeliveryTimeline({ timeline, onMilestoneClick }: DeliveryTimelineProps) {
  // Calculate progress percentage
  const completedCount = timeline.filter((m) => m.status === 'completed').length
  const progress = Math.max(5, (completedCount / timeline.length) * 100)

  // Find current (first non-completed) milestone index
  const currentIndex = timeline.findIndex((m) => m.status !== 'completed')

  return (
    <div className="bg-bg-card border border-border-color rounded-lg p-8 overflow-x-auto">
      <div className="relative min-h-[280px] px-10">
        {/* Timeline Track */}
        <div className="absolute top-11 left-10 right-10 h-[3px] bg-timeline-line rounded-sm">
          <div
            className="absolute top-0 left-0 h-full bg-rag-green rounded-sm animate-[trackFill_1s_ease_forwards_0.3s]"
            style={{ '--progress': `${progress}%` } as React.CSSProperties}
          />
        </div>

        {/* Timeline Nodes */}
        <div className="flex justify-between relative min-w-[1000px]">
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
```

### 3.5 Create WeeklyStatus Component

```typescript
// src/components/weekly-status.tsx
import { cn } from '@/lib/utils'
import type { Achievement, FocusItem, AchievementStatus } from '@/types'

interface WeeklyStatusProps {
  achievements: Achievement[]
  focus: FocusItem[]
}

export function WeeklyStatus({ achievements, focus }: WeeklyStatusProps) {
  return (
    <div className="grid grid-cols-2 gap-5 md:grid-cols-1">
      <StatusCard title="Achievements This Week">
        {achievements.map((item, index) => (
          <StatusItem
            key={item.id}
            text={item.description}
            status={item.status}
            delay={index * 0.05}
          />
        ))}
        {achievements.length === 0 && (
          <p className="text-sm text-text-muted py-2">No achievements recorded</p>
        )}
      </StatusCard>

      <StatusCard title="Focus Next Week">
        {focus.map((item, index) => (
          <StatusItem
            key={item.id}
            text={item.description}
            status="pending"
            delay={index * 0.05}
          />
        ))}
        {focus.length === 0 && (
          <p className="text-sm text-text-muted py-2">No focus items defined</p>
        )}
      </StatusCard>
    </div>
  )
}

interface StatusCardProps {
  title: string
  children: React.ReactNode
}

function StatusCard({ title, children }: StatusCardProps) {
  return (
    <div className="bg-bg-card border border-border-color rounded-lg p-6">
      <div className="flex justify-between items-center mb-4 pb-3 border-b border-border-color">
        <h3 className="text-[15px] font-semibold text-text-primary">{title}</h3>
      </div>
      <ul className="list-none">{children}</ul>
    </div>
  )
}

interface StatusItemProps {
  text: string
  status: AchievementStatus | 'pending'
  delay: number
}

function StatusItem({ text, status, delay }: StatusItemProps) {
  return (
    <li
      className="flex items-start gap-3 py-2.5 border-b border-white/[0.04] last:border-b-0
                 opacity-0 animate-[fadeIn_0.4s_ease_forwards]"
      style={{ animationDelay: `${delay}s` }}
    >
      <StatusIcon status={status} />
      <span className="text-[13px] text-text-secondary">{text}</span>
    </li>
  )
}

interface StatusIconProps {
  status: AchievementStatus | 'pending'
}

function StatusIcon({ status }: StatusIconProps) {
  const config = {
    done: {
      bg: 'bg-rag-green-dim',
      text: 'text-rag-green',
      icon: '✓',
    },
    in_progress: {
      bg: 'bg-rag-amber-dim',
      text: 'text-rag-amber',
      icon: '○',
    },
    pending: {
      bg: 'bg-accent-cyan-dim',
      text: 'text-accent-cyan',
      icon: '→',
    },
  }[status ?? 'pending']

  return (
    <span
      className={cn(
        'w-5 h-5 rounded-full flex items-center justify-center text-[11px] flex-shrink-0 mt-0.5',
        config.bg,
        config.text
      )}
    >
      {config.icon}
    </span>
  )
}
```

### 3.6 Create RaidLog Component

```typescript
// src/components/raid-log.tsx
'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { RaidItem, RaidType, ImpactLevel, RAGStatus } from '@/types'

interface RaidLogProps {
  items: RaidItem[]
}

type FilterType = 'all' | RaidType

export function RaidLog({ items }: RaidLogProps) {
  const [filter, setFilter] = useState<FilterType>('all')

  const filteredItems = filter === 'all'
    ? items
    : items.filter((item) => item.type === filter)

  return (
    <div className="bg-bg-card border border-border-color rounded-lg p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 pb-3 border-b border-border-color flex-wrap gap-3">
        <h3 className="text-[15px] font-semibold text-text-primary">
          Risks, Issues & Dependencies
        </h3>
        <RaidFilters activeFilter={filter} onFilterChange={setFilter} />
      </div>

      {/* Table */}
      <div className="w-full">
        {filteredItems.map((item, index) => (
          <RaidRow key={item.id} item={item} delay={index * 0.05} />
        ))}
        {filteredItems.length === 0 && (
          <p className="text-sm text-text-muted py-4 text-center">
            No items found
          </p>
        )}
      </div>
    </div>
  )
}

interface RaidFiltersProps {
  activeFilter: FilterType
  onFilterChange: (filter: FilterType) => void
}

function RaidFilters({ activeFilter, onFilterChange }: RaidFiltersProps) {
  const filters: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'issue', label: 'Issues' },
    { value: 'risk', label: 'Risks' },
    { value: 'dependency', label: 'Dependencies' },
  ]

  return (
    <div className="flex gap-1.5">
      {filters.map((f) => (
        <button
          key={f.value}
          onClick={() => onFilterChange(f.value)}
          className={cn(
            'border px-3.5 py-1.5 rounded-full text-[11px] font-medium cursor-pointer',
            'transition-all duration-200',
            activeFilter === f.value
              ? 'bg-accent-cyan border-accent-cyan text-bg-primary'
              : 'bg-transparent border-border-color text-text-secondary hover:border-accent-cyan hover:text-accent-cyan'
          )}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}

interface RaidRowProps {
  item: RaidItem
  delay: number
}

function RaidRow({ item, delay }: RaidRowProps) {
  return (
    <div
      className="grid grid-cols-[90px_150px_1fr_70px_110px_40px] gap-4 py-3.5
                 border-b border-white/[0.04] last:border-b-0 items-start
                 opacity-0 animate-[fadeIn_0.4s_ease_forwards]
                 lg:grid-cols-1 lg:gap-2"
      style={{ animationDelay: `${delay}s` }}
    >
      <div>
        <RaidTypeBadge type={item.type} />
      </div>
      <div className="text-[13px] font-medium text-text-primary">
        {item.area}
      </div>
      <div className="text-xs text-text-secondary leading-relaxed">
        {item.description}
      </div>
      <div className={cn('text-[11px] font-semibold uppercase', getImpactColor(item.impact))}>
        {item.impact}
      </div>
      <div className="text-xs text-text-muted">
        {item.owner ?? '-'}
      </div>
      <div>
        <div className={cn('w-2.5 h-2.5 rounded-full', getRagColor(item.ragStatus))} />
      </div>
    </div>
  )
}

interface RaidTypeBadgeProps {
  type: RaidType
}

function RaidTypeBadge({ type }: RaidTypeBadgeProps) {
  const styles: Record<RaidType, string> = {
    issue: 'bg-rag-red-dim text-rag-red',
    risk: 'bg-rag-amber-dim text-rag-amber',
    dependency: 'bg-accent-cyan-dim text-accent-cyan',
  }

  return (
    <span
      className={cn(
        'text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded inline-block',
        styles[type]
      )}
    >
      {type}
    </span>
  )
}

function getImpactColor(impact: ImpactLevel): string {
  return {
    high: 'text-rag-red',
    medium: 'text-rag-amber',
    low: 'text-rag-green',
  }[impact]
}

function getRagColor(rag: RAGStatus): string {
  return {
    green: 'bg-rag-green',
    amber: 'bg-rag-amber',
    red: 'bg-rag-red',
  }[rag]
}
```

### 3.7 Create Resources Component

```typescript
// src/components/resources.tsx
import { cn } from '@/lib/utils'
import type { ResourceItem, ResourceType } from '@/types'

interface ResourcesProps {
  resources: ResourceItem[]
}

export function Resources({ resources }: ResourcesProps) {
  return (
    <div className="bg-bg-card border border-border-color rounded-lg p-6">
      <div className="flex justify-between items-center mb-4 pb-3 border-b border-border-color">
        <h3 className="text-[15px] font-semibold text-text-primary">
          Documentation & Links
        </h3>
      </div>

      {resources.length === 0 ? (
        <p className="text-sm text-text-muted">
          No resources available for this vendor.
        </p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3">
          {resources.map((resource, index) => (
            <ResourceCard key={resource.id} resource={resource} delay={index * 0.05} />
          ))}
        </div>
      )}
    </div>
  )
}

interface ResourceCardProps {
  resource: ResourceItem
  delay: number
}

function ResourceCard({ resource, delay }: ResourceCardProps) {
  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 px-4 py-3.5 bg-bg-secondary border border-border-color
                 rounded-md no-underline transition-all duration-200
                 hover:border-accent-cyan hover:bg-bg-card-hover hover:-translate-y-0.5
                 opacity-0 animate-[fadeIn_0.4s_ease_forwards] group"
      style={{ animationDelay: `${delay}s` }}
    >
      <ResourceIcon type={resource.type} />
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium text-text-primary mb-0.5 truncate">
          {resource.name}
        </div>
        <div className="text-[11px] text-text-muted truncate">
          {resource.description ?? resource.url}
        </div>
      </div>
      <span className="text-text-muted text-sm transition-all duration-200 group-hover:text-accent-cyan group-hover:translate-x-0.5">
        →
      </span>
    </a>
  )
}

interface ResourceIconProps {
  type: ResourceType
}

function ResourceIcon({ type }: ResourceIconProps) {
  const config: Record<ResourceType, { bg: string; color: string; icon: string }> = {
    confluence: {
      bg: 'bg-[rgba(0,82,204,0.2)]',
      color: 'text-[#4c9aff]',
      icon: '📖',
    },
    jira: {
      bg: 'bg-[rgba(0,135,255,0.2)]',
      color: 'text-[#2684ff]',
      icon: '🎫',
    },
    github: {
      bg: 'bg-white/10',
      color: 'text-white',
      icon: '🖥',
    },
    docs: {
      bg: 'bg-accent-cyan-dim',
      color: 'text-accent-cyan',
      icon: '📄',
    },
  }

  const { bg, icon } = config[type]

  return (
    <div
      className={cn(
        'w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0',
        bg
      )}
    >
      {icon}
    </div>
  )
}
```

### 3.8 Create MilestoneModal Component

```typescript
// src/components/milestone-modal.tsx
'use client'

import { useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import type { TimelineMilestone } from '@/types'

interface MilestoneModalProps {
  milestone: TimelineMilestone | null
  isOpen: boolean
  onClose: () => void
}

export function MilestoneModal({ milestone, isOpen, onClose }: MilestoneModalProps) {
  // Handle escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose]
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleKeyDown])

  if (!milestone) return null

  return (
    <div
      className={cn(
        'fixed inset-0 bg-bg-primary/85 backdrop-blur-sm flex items-center justify-center z-[1000]',
        'transition-all duration-300',
        isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
      )}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={cn(
          'bg-bg-card border border-border-color rounded-lg p-7 max-w-[480px] w-[90%]',
          'shadow-lg transition-all duration-300',
          isOpen ? 'scale-100 translate-y-0' : 'scale-90 translate-y-5'
        )}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-5">
          <div>
            <h2 className="text-xl font-semibold text-accent-cyan">{milestone.title}</h2>
            <p className="text-[13px] text-text-muted mt-1">{milestone.date}</p>
          </div>
          <button
            onClick={onClose}
            className="bg-bg-secondary border border-border-color w-8 h-8 rounded-full
                       cursor-pointer text-lg text-text-secondary flex items-center justify-center
                       transition-all duration-200 hover:bg-accent-cyan hover:border-accent-cyan hover:text-bg-primary"
          >
            ×
          </button>
        </div>

        {/* Platforms */}
        <div className="mb-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-2">
            Platforms
          </p>
          <div className="flex flex-wrap gap-1.5">
            {milestone.platforms.map((platform) => (
              <span
                key={platform}
                className="bg-bg-secondary border border-border-color px-2.5 py-1.5 rounded-md text-xs text-text-secondary"
              >
                {platform}
              </span>
            ))}
          </div>
        </div>

        {/* Features */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-2">
            Contains
          </p>
          <ul className="list-none">
            {milestone.features.map((feature, index) => (
              <li
                key={index}
                className="py-2 text-[13px] text-text-secondary border-b border-white/[0.04] last:border-b-0
                           flex items-center gap-2"
              >
                <span className="w-1 h-1 bg-accent-cyan rounded-full" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
```

### 3.9 Create Section Components

```typescript
// src/components/section.tsx
import { cn } from '@/lib/utils'

interface SectionProps {
  title: string
  delay?: number
  children: React.ReactNode
  headerContent?: React.ReactNode
}

export function Section({ title, delay = 0, children, headerContent }: SectionProps) {
  return (
    <section
      className={cn(
        'mb-8 opacity-0 animate-fadeInUp',
        delay > 0 && `[animation-delay:${delay}s]`
      )}
      style={{ animationDelay: delay > 0 ? `${delay}s` : undefined }}
    >
      <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-text-muted">
          {title}
        </p>
        {headerContent}
      </div>
      {children}
    </section>
  )
}
```

### 3.10 Create Index Exports

```typescript
// src/components/index.ts
export { Header } from './header'
export { VendorTabs } from './vendor-tabs'
export { WeekNavigation } from './week-navigation'
export { DeliveryTimeline } from './delivery-timeline'
export { WeeklyStatus } from './weekly-status'
export { RaidLog } from './raid-log'
export { Resources } from './resources'
export { MilestoneModal } from './milestone-modal'
export { Section } from './section'
```

## Verification Steps

1. **Create test page with mock data:**
   Create a temporary test page that imports all components with hardcoded data to verify styling.

2. **Check each component:**
   - Header renders with logo and date
   - VendorTabs renders clickable cards with correct colors
   - WeekNavigation dropdown and buttons work
   - DeliveryTimeline shows nodes with correct status colors
   - WeeklyStatus shows achievements and focus items
   - RaidLog filters work correctly
   - Resources links open in new tabs
   - MilestoneModal opens and closes properly

3. **Compare with POC:**
   Open the POC (`poc/index.html`) and the component test page side-by-side to verify visual match.

## Files Created

```
src/components/
├── header.tsx
├── vendor-tabs.tsx
├── week-navigation.tsx
├── delivery-timeline.tsx
├── weekly-status.tsx
├── raid-log.tsx
├── resources.tsx
├── milestone-modal.tsx
├── section.tsx
└── index.ts
```

## Success Criteria

- [ ] All components render without errors
- [ ] Colors match the POC exactly
- [ ] Animations are smooth and match POC timing
- [ ] Interactive elements (buttons, filters, tabs) work correctly
- [ ] Modal opens/closes with keyboard and click
- [ ] Responsive layout works on smaller screens
- [ ] Components are properly typed with TypeScript

## Next Phase

Proceed to [Phase 4: Integration & Polish](./phase-4-integration-and-polish.md)
