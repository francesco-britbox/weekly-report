'use client'

import { useState } from 'react'
import clsx from 'clsx'
import { useFeedback } from '@/hooks/use-report'
import { FeedbackForm } from './feedback-form'
import { FeedbackDisplay } from './feedback-display'
import { Section } from './section'
import { getUserId, isCurrentUser } from '@/lib/user-identity'
import type { Feedback } from '@/types'

interface FeedbackSectionProps {
  vendorId: string
  weekStart: string
}

export function FeedbackSection({ vendorId, weekStart }: FeedbackSectionProps) {
  const { data, error, isLoading, mutate } = useFeedback(vendorId, weekStart)
  const [editingFeedbackId, setEditingFeedbackId] = useState<string | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)

  const feedbackList = data?.feedback || []
  const currentUserId = getUserId()

  // Find current user's feedback if it exists
  const userFeedback = feedbackList.find(f => isCurrentUser(f.userId))
  const othersFeedback = feedbackList.filter(f => !isCurrentUser(f.userId))

  const handleSave = async (userName: string, feedbackHtml: string) => {
    const response = await fetch('/api/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vendor_id: vendorId,
        week_start: weekStart,
        user_id: currentUserId,
        user_name: userName,
        feedback_html: feedbackHtml,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to save feedback')
    }

    // Revalidate the data
    await mutate()
    setEditingFeedbackId(null)
    setIsAddingNew(false)
  }

  const handleEdit = (feedbackId: string) => {
    setEditingFeedbackId(feedbackId)
    setIsAddingNew(false)
  }

  const handleCancelEdit = () => {
    setEditingFeedbackId(null)
  }

  const handleAddNew = () => {
    setIsAddingNew(true)
    setEditingFeedbackId(null)
  }

  const handleCancelAdd = () => {
    setIsAddingNew(false)
  }

  return (
    <Section title="Product Feedback" delay={0.5}>
      <div className="space-y-4">
        {isLoading && (
          <div className="text-gray-400 text-sm">Loading feedback...</div>
        )}

        {error && (
          <div className="text-red-400 text-sm">Failed to load feedback</div>
        )}

        {!isLoading && !error && (
          <>
            {/* Current User's Feedback */}
            {userFeedback && editingFeedbackId !== userFeedback.id && !isAddingNew && (
              <div className={clsx(
                'rounded-lg border border-cyan-500/30',
                'bg-gray-800/50 p-6',
                'animate-fadeIn'
              )}>
                <FeedbackDisplay
                  feedback={userFeedback}
                  onEdit={() => handleEdit(userFeedback.id)}
                />
              </div>
            )}

            {/* Edit Form for Current User's Feedback */}
            {userFeedback && editingFeedbackId === userFeedback.id && (
              <div className={clsx(
                'rounded-lg border border-cyan-500/50',
                'bg-gray-800/50 p-6',
                'animate-fadeIn'
              )}>
                <FeedbackForm
                  vendorId={vendorId}
                  weekStart={weekStart}
                  initialContent={userFeedback.feedbackHtml}
                  initialUserName={userFeedback.userName}
                  onSave={handleSave}
                  onCancel={handleCancelEdit}
                />
              </div>
            )}

            {/* Add New Feedback Form (if user hasn't added feedback yet) */}
            {!userFeedback && isAddingNew && (
              <div className={clsx(
                'rounded-lg border border-cyan-500/50',
                'bg-gray-800/50 p-6',
                'animate-fadeIn'
              )}>
                <FeedbackForm
                  vendorId={vendorId}
                  weekStart={weekStart}
                  onSave={handleSave}
                  onCancel={handleCancelAdd}
                />
              </div>
            )}

            {/* Add Feedback Button (if user hasn't added feedback yet and not editing) */}
            {!userFeedback && !isAddingNew && (
              <button
                type="button"
                onClick={handleAddNew}
                className={clsx(
                  'w-full px-4 py-3 rounded-lg',
                  'border border-dashed border-gray-700/50',
                  'text-gray-400 hover:text-gray-300',
                  'hover:border-cyan-500/50 hover:bg-gray-800/30',
                  'transition-all text-left flex items-center gap-2'
                )}
              >
                <span className="text-xl">💬</span>
                <span>Add Your Feedback</span>
              </button>
            )}

            {/* Other Users' Feedback */}
            {othersFeedback.length > 0 && (
              <div className="space-y-3">
                {othersFeedback.length > 1 && (
                  <div className="text-gray-400 text-sm font-medium">
                    Feedback from team ({othersFeedback.length})
                  </div>
                )}
                {othersFeedback.map((feedback) => (
                  <div
                    key={feedback.id}
                    className={clsx(
                      'rounded-lg border border-gray-700/50',
                      'bg-gray-800/30 p-6',
                      'animate-fadeIn'
                    )}
                  >
                    <FeedbackDisplay
                      feedback={feedback}
                      showEditButton={false}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Empty state when no feedback at all */}
            {feedbackList.length === 0 && !isAddingNew && (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-3">💬</div>
                <div className="text-sm">No feedback yet. Be the first to add feedback!</div>
              </div>
            )}
          </>
        )}
      </div>
    </Section>
  )
}
