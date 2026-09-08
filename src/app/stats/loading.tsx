export default function StatsLoading() {
  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col font-sans">
      {/* Header bar placeholder */}
      <header className="h-16 border-b border-[var(--border-main)] bg-[var(--bg-surface)] px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[var(--bg-card)] animate-pulse" />
          <div className="h-6 w-28 rounded-md bg-[var(--bg-card)] animate-pulse" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-9 w-24 rounded-xl bg-[var(--bg-card)] animate-pulse" />
          <div className="w-9 h-9 rounded-full bg-[var(--bg-card)] animate-pulse" />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        <div className="border-b border-[var(--border-main)] pb-6 space-y-2">
          <div className="h-8 w-60 bg-[var(--bg-card)] rounded-md animate-pulse" />
          <div className="h-4 w-96 bg-[var(--bg-card)] rounded-md animate-pulse" />
        </div>

        <div className="space-y-8 animate-fadeIn">
          {/* Top Stat Cards Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-main)] shadow-xs space-y-3 relative overflow-hidden"
              >
                <div className="absolute inset-0 skeleton-shimmer pointer-events-none" />
                <div className="flex items-center justify-between">
                  <div className="h-3.5 w-24 bg-[var(--bg-card)] rounded animate-pulse" />
                  <div className="w-4 h-4 bg-[var(--bg-card)] rounded-full animate-pulse" />
                </div>
                <div className="h-9 w-16 bg-[var(--bg-card)] rounded-md animate-pulse" />
                <div className="h-3 w-32 bg-[var(--bg-card)] rounded animate-pulse" />
              </div>
            ))}
          </div>

          {/* Content Cards Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="p-8 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-main)] shadow-xs space-y-4 relative overflow-hidden h-64">
              <div className="absolute inset-0 skeleton-shimmer pointer-events-none" />
              <div className="h-6 w-48 bg-[var(--bg-card)] rounded animate-pulse" />
              <div className="space-y-3 pt-4">
                <div className="h-4 w-full bg-[var(--bg-card)] rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-[var(--bg-card)] rounded animate-pulse" />
                <div className="h-4 w-4/5 bg-[var(--bg-card)] rounded animate-pulse" />
              </div>
            </div>
            <div className="p-8 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-main)] shadow-xs space-y-4 relative overflow-hidden h-64">
              <div className="absolute inset-0 skeleton-shimmer pointer-events-none" />
              <div className="h-6 w-48 bg-[var(--bg-card)] rounded animate-pulse" />
              <div className="space-y-3 pt-4">
                <div className="h-4 w-full bg-[var(--bg-card)] rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-[var(--bg-card)] rounded animate-pulse" />
                <div className="h-4 w-4/5 bg-[var(--bg-card)] rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
