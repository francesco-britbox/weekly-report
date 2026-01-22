import { cn } from '@/lib/utils'
import type { Achievement, FocusItem, AchievementStatus } from '@/types'

interface WeeklyStatusProps {
  achievements: Achievement[]
  focus: FocusItem[]
}

export function WeeklyStatus({ achievements, focus }: WeeklyStatusProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
    <div className="bg-bg-card border border-border-color rounded-lg p-6 h-full">
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
