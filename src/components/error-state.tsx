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
