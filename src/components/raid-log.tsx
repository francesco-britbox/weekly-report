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
      className="raid-row grid grid-cols-[90px_150px_1fr_70px_110px_40px] gap-4 py-3.5
                 border-b border-white/[0.04] last:border-b-0 items-start
                 opacity-0 animate-[fadeIn_0.4s_ease_forwards]"
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
