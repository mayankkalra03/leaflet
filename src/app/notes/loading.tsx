export default function NotesLoading() {
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-main)] shadow-xs space-y-4 relative overflow-hidden"
            >
              <div className="absolute inset-0 skeleton-shimmer pointer-events-none" />
              <div className="flex items-center justify-between">
                <div className="h-4 w-32 bg-[var(--bg-card)] rounded-md animate-pulse" />
                <div className="h-4 w-16 bg-[var(--bg-card)] rounded-md animate-pulse" />
              </div>
              <div className="space-y-2 p-3 rounded-xl bg-[var(--bg-card)]/70">
                <div className="h-4 w-full bg-[var(--border-main)]/50 rounded-md animate-pulse" />
                <div className="h-4 w-4/5 bg-[var(--border-main)]/50 rounded-md animate-pulse" />
                <div className="h-4 w-2/3 bg-[var(--border-main)]/50 rounded-md animate-pulse" />
              </div>
              <div className="pt-3 border-t border-[var(--border-main)] flex items-center justify-between">
                <div className="h-4 w-20 bg-[var(--bg-card)] rounded-md animate-pulse" />
                <div className="w-5 h-5 bg-[var(--bg-card)] rounded-full animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
