export function VendorTabsSkeleton() {
  return (
    <div className="flex gap-3 mb-10 flex-wrap">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="bg-bg-card border border-border-color px-5 py-3.5 rounded-md
                     min-w-[200px] animate-pulse"
        >
          <div className="h-4 bg-bg-card-hover rounded w-32 mb-2" />
          <div className="h-3 bg-bg-card-hover rounded w-20" />
        </div>
      ))}
    </div>
  )
}

export function TimelineSkeleton() {
  return (
    <div className="bg-bg-card border border-border-color rounded-lg p-8 overflow-x-auto">
      <div className="px-10 pb-4">
        <div className="flex justify-between gap-4 min-w-[1000px]">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex flex-col items-center w-[130px] animate-pulse">
              <div className="h-5 bg-bg-card-hover rounded w-16 mb-3" />
              <div className="w-6 h-6 bg-bg-card-hover rounded-full mb-2" />
              <div className="w-0.5 h-6 bg-bg-card-hover my-2" />
              <div className="w-full bg-bg-card-hover rounded h-24" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function StatusCardSkeleton() {
  return (
    <div className="bg-bg-card border border-border-color rounded-lg p-6 animate-pulse">
      <div className="h-5 bg-bg-card-hover rounded w-40 mb-4" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-5 h-5 bg-bg-card-hover rounded-full" />
            <div className="h-4 bg-bg-card-hover rounded flex-1" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function RaidLogSkeleton() {
  return (
    <div className="bg-bg-card border border-border-color rounded-lg p-6 animate-pulse">
      <div className="h-5 bg-bg-card-hover rounded w-48 mb-4" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="grid grid-cols-6 gap-4">
            <div className="h-6 bg-bg-card-hover rounded" />
            <div className="h-6 bg-bg-card-hover rounded" />
            <div className="h-6 bg-bg-card-hover rounded col-span-2" />
            <div className="h-6 bg-bg-card-hover rounded" />
            <div className="h-6 bg-bg-card-hover rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function ResourcesSkeleton() {
  return (
    <div className="bg-bg-card border border-border-color rounded-lg p-6 animate-pulse">
      <div className="h-5 bg-bg-card-hover rounded w-40 mb-4" />
      <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3.5 bg-bg-secondary rounded-md">
            <div className="w-9 h-9 bg-bg-card-hover rounded-lg" />
            <div className="flex-1">
              <div className="h-4 bg-bg-card-hover rounded w-32 mb-1" />
              <div className="h-3 bg-bg-card-hover rounded w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
