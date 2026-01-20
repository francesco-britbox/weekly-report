import { cn } from '@/lib/utils'
import type { VendorSummary, RAGStatus } from '@/types'

interface VendorTabsProps {
  vendors: VendorSummary[]
  currentVendorId: string | null
  onVendorSelect: (vendorId: string) => void
}

export function VendorTabs({ vendors, currentVendorId, onVendorSelect }: VendorTabsProps) {
  return (
    <div className="flex gap-3 mb-10 flex-wrap">
      {vendors.map((vendor) => (
        <VendorTab
          key={vendor.id}
          vendor={vendor}
          isActive={vendor.id === currentVendorId}
          onClick={() => onVendorSelect(vendor.id)}
        />
      ))}
    </div>
  )
}

interface VendorTabProps {
  vendor: VendorSummary
  isActive: boolean
  onClick: () => void
}

function VendorTab({ vendor, isActive, onClick }: VendorTabProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'border px-5 py-3.5 rounded-md cursor-pointer',
        'flex items-center gap-3.5 min-w-[200px] transition-all duration-200',
        isActive
          ? 'bg-accent-cyan border-accent-cyan'
          : 'bg-bg-card border-border-color hover:bg-bg-card-hover hover:border-accent-cyan-dim hover:-translate-y-0.5'
      )}
    >
      <div className="text-left flex-1">
        <div className={cn(
          'font-semibold text-sm tracking-tight',
          isActive ? 'text-[#00182b]' : 'text-text-primary'
        )}>
          {vendor.name}
        </div>
        <div className={cn(
          'text-xs mt-0.5',
          isActive ? 'text-[rgba(0,24,43,0.7)]' : 'text-text-secondary'
        )}>
          {vendor.owner ?? 'No owner assigned'}
        </div>
      </div>
      <RagIndicator status={vendor.ragStatus} />
    </button>
  )
}

interface RagIndicatorProps {
  status: RAGStatus | null
}

function RagIndicator({ status }: RagIndicatorProps) {
  const colorClass = {
    green: 'bg-rag-green shadow-[0_0_8px_var(--rag-green)]',
    amber: 'bg-rag-amber shadow-[0_0_8px_var(--rag-amber)]',
    red: 'bg-rag-red shadow-[0_0_8px_var(--rag-red)]',
  }[status ?? 'green']

  return (
    <div className={cn('w-3 h-3 rounded-full flex-shrink-0', colorClass)} />
  )
}
