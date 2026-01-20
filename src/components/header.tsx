import Image from 'next/image'

interface HeaderProps {
  reportDate: string
}

export function Header({ reportDate }: HeaderProps) {
  return (
    <header className="bg-bg-secondary border-b border-border-color px-10 py-4 sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto flex justify-between items-center">
        <Image
          src="/images/logo.png"
          alt="Logo"
          width={112}
          height={28}
          className="h-7 w-auto"
          priority
        />
        <div className="flex items-center gap-6">
          <span className="text-sm font-medium text-text-secondary">
            Delivery Weekly Report
          </span>
          <span className="text-sm font-semibold text-accent-cyan">
            {reportDate}
          </span>
        </div>
      </div>
    </header>
  )
}
