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
