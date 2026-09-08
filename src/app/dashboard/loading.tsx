export default function DashboardLoading() {
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
        {/* Banner Skeleton */}
        <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-main)] p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-xs">
          <div className="absolute inset-0 skeleton-shimmer pointer-events-none" />
          <div className="space-y-3 w-full md:w-2/3">
            <div className="h-4 w-32 bg-[var(--bg-card)] rounded-md animate-pulse" />
            <div className="h-8 w-64 bg-[var(--bg-card)] rounded-md animate-pulse" />
            <div className="h-4 w-48 bg-[var(--bg-card)] rounded-md animate-pulse" />
          </div>
          <div className="h-12 w-36 bg-[var(--bg-card)] rounded-xl animate-pulse" />
        </div>

        {/* Toolbar Skeleton */}
        <div className="flex items-center justify-between gap-4">
          <div className="h-10 w-80 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl animate-pulse" />
          <div className="flex items-center gap-3">
            <div className="h-9 w-28 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl animate-pulse" />
            <div className="h-9 w-32 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl animate-pulse" />
          </div>
        </div>

        {/* Book Cards Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-main)] overflow-hidden shadow-xs p-5 space-y-4 relative"
            >
              <div className="absolute inset-0 skeleton-shimmer pointer-events-none" />
              <div className="flex items-center justify-between">
                <div className="w-6 h-6 rounded-full bg-[var(--bg-card)] animate-pulse" />
                <div className="w-14 h-5 rounded-full bg-[var(--bg-card)] animate-pulse" />
              </div>
              <div className="h-28 rounded-xl bg-[var(--bg-card)]/80 flex items-center justify-center animate-pulse">
                <div className="w-8 h-8 rounded-lg bg-[var(--border-main)]/60" />
              </div>
              <div className="space-y-2 pt-1">
                <div className="h-5 w-3/4 bg-[var(--bg-card)] rounded-md animate-pulse" />
                <div className="h-3.5 w-1/2 bg-[var(--bg-card)] rounded-md animate-pulse" />
              </div>
              <div className="pt-3 border-t border-[var(--border-main)] flex items-center justify-between">
                <div className="h-3 w-16 bg-[var(--bg-card)] rounded-md animate-pulse" />
                <div className="h-7 w-20 bg-[var(--bg-card)] rounded-lg animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
