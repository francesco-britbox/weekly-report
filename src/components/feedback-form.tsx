'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { useState, useEffect } from 'react'
import clsx from 'clsx'
import { getUserName, setUserName as saveUserName } from '@/lib/user-identity'

interface FeedbackFormProps {
  vendorId: string
  weekStart: string
  initialContent?: string
  initialUserName?: string
  onSave: (userName: string, feedbackHtml: string) => Promise<void>
  onCancel?: () => void
}

export function FeedbackForm({
  vendorId,
  weekStart,
  initialContent = '',
  initialUserName = '',
  onSave,
  onCancel,
}: FeedbackFormProps) {
  const [userName, setUserName] = useState(initialUserName)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Pre-fill user name from localStorage on mount
  useEffect(() => {
    if (!initialUserName) {
      const savedName = getUserName()
      if (savedName) {
        setUserName(savedName)
      }
    }
  }, [initialUserName])

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Share your feedback on this week\'s report...',
      }),
    ],
    content: initialContent,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: clsx(
          'prose prose-invert max-w-none',
          'min-h-[150px] px-4 py-3',
          'focus:outline-none',
          'text-gray-100'
        ),
      },
    },
  })

  const handleSave = async () => {
    if (!editor || !userName.trim()) {
      setError('Please enter your name')
      return
    }

    const html = editor.getHTML()
    if (html === '<p></p>' || !html.trim()) {
      setError('Please enter feedback content')
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      // Save user name to localStorage for next time
      saveUserName(userName.trim())
      await onSave(userName.trim(), html)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save feedback')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="userName" className="block text-sm font-medium text-gray-300 mb-2">
          Your Name
        </label>
        <input
          id="userName"
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="e.g., Product Manager"
          className={clsx(
            'w-full px-4 py-2 rounded-lg',
            'bg-gray-800/50 border border-gray-700/50',
            'text-gray-100 placeholder-gray-500',
            'focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50',
            'transition-colors'
          )}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-300">
            Feedback
          </label>
          {editor && (
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={clsx(
                  'px-2 py-1 text-xs rounded',
                  'border border-gray-700/50',
                  'hover:bg-gray-700/50 transition-colors',
                  editor.isActive('bold') ? 'bg-gray-700/50 text-cyan-400' : 'text-gray-400'
                )}
                title="Bold"
              >
                <strong>B</strong>
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={clsx(
                  'px-2 py-1 text-xs rounded',
                  'border border-gray-700/50',
                  'hover:bg-gray-700/50 transition-colors',
                  editor.isActive('italic') ? 'bg-gray-700/50 text-cyan-400' : 'text-gray-400'
                )}
                title="Italic"
              >
                <em>I</em>
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={clsx(
                  'px-2 py-1 text-xs rounded',
                  'border border-gray-700/50',
                  'hover:bg-gray-700/50 transition-colors',
                  editor.isActive('bulletList') ? 'bg-gray-700/50 text-cyan-400' : 'text-gray-400'
                )}
                title="Bullet List"
              >
                • List
              </button>
            </div>
          )}
        </div>
        <div className={clsx(
          'rounded-lg border border-gray-700/50',
          'bg-gray-800/50',
          'focus-within:ring-2 focus-within:ring-cyan-500/50 focus-within:border-cyan-500/50',
          'transition-all'
        )}>
          <EditorContent editor={editor} />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className={clsx(
            'px-6 py-2 rounded-lg font-medium',
            'bg-cyan-500 text-gray-900',
            'hover:bg-cyan-400 transition-colors',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          {isSaving ? 'Saving...' : 'Save Feedback'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className={clsx(
              'px-6 py-2 rounded-lg font-medium',
              'bg-gray-700/50 text-gray-300',
              'hover:bg-gray-700 transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  )
}
