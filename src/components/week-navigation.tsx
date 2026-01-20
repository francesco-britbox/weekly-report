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
