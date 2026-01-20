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
