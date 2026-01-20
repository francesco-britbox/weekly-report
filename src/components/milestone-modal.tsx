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
