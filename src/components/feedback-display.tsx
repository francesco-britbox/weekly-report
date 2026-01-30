'use client'

import { format } from 'date-fns'
import clsx from 'clsx'
import DOMPurify from 'dompurify'
import type { Feedback } from '@/types'
import { useMemo } from 'react'
import { isCurrentUser } from '@/lib/user-identity'

interface FeedbackDisplayProps {
  feedback: Feedback
  onEdit?: () => void
  showEditButton?: boolean
}

export function FeedbackDisplay({ feedback, onEdit, showEditButton = true }: FeedbackDisplayProps) {
  // Sanitize HTML to prevent XSS attacks
  // useMemo to avoid re-sanitizing on every render
  const sanitizedHtml = useMemo(() => {
    if (typeof window === 'undefined') return feedback.feedbackHtml
    return DOMPurify.sanitize(feedback.feedbackHtml, {
      ALLOWED_TAGS: ['p', 'strong', 'em', 'b', 'i', 'ul', 'ol', 'li', 'br'],
      ALLOWED_ATTR: [],
    })
  }, [feedback.feedbackHtml])

  // Check if current user owns this feedback
  const isOwner = isCurrentUser(feedback.userId)

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-gray-300 font-medium">
              {feedback.userName}
              {isOwner && (
                <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400">
                  You
                </span>
              )}
            </span>
            <span className="text-gray-500 text-sm">
              {format(new Date(feedback.createdAt), 'MMM d, yyyy · HH:mm')}
            </span>
          </div>
          {feedback.updatedAt !== feedback.createdAt && (
            <span className="text-gray-500 text-xs">
              Edited {format(new Date(feedback.updatedAt), 'MMM d, yyyy · HH:mm')}
            </span>
          )}
        </div>
        {onEdit && showEditButton && isOwner && (
          <button
            type="button"
            onClick={onEdit}
            className={clsx(
              'px-3 py-1 text-sm rounded-lg',
              'border border-gray-700/50',
              'text-gray-400 hover:text-gray-200',
              'hover:bg-gray-700/50 transition-colors'
            )}
          >
            Edit
          </button>
        )}
      </div>

      <div
        className={clsx(
          'prose prose-invert max-w-none',
          'text-gray-200',
          'prose-headings:text-gray-100',
          'prose-p:text-gray-200',
          'prose-strong:text-gray-100',
          'prose-em:text-gray-300',
          'prose-ul:text-gray-200',
          'prose-li:text-gray-200'
        )}
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    </div>
  )
}
