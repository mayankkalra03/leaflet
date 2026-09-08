export default function ReaderLoading() {
  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-[#F9F6F0] font-sans">
      {/* Header Skeleton */}
      <header className="h-14 shrink-0 border-b border-[#E7E5E4] bg-white px-4 flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#F4F0E8] animate-pulse" />
          <div className="h-5 w-48 rounded-md bg-[#F4F0E8] animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-28 rounded-xl bg-[#F4F0E8] animate-pulse" />
          <div className="h-8 w-20 rounded-xl bg-[#F4F0E8] animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#F4F0E8] animate-pulse" />
          <div className="w-8 h-8 rounded-xl bg-[#F4F0E8] animate-pulse" />
        </div>
      </header>

      {/* Reader Body Skeleton */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Sidebar Skeleton */}
        <aside className="w-80 shrink-0 h-full border-r border-[#E7E5E4] bg-white p-4 space-y-4 hidden md:block">
          <div className="flex border-b border-[#E7E5E4] pb-3 gap-2">
            <div className="h-6 flex-1 rounded bg-[#F4F0E8] animate-pulse" />
            <div className="h-6 flex-1 rounded bg-[#F4F0E8] animate-pulse" />
            <div className="h-6 flex-1 rounded bg-[#F4F0E8] animate-pulse" />
          </div>
          <div className="space-y-3 pt-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-10 rounded-xl bg-[#FAF8F5] border border-[#E7E5E4] animate-pulse" />
            ))}
          </div>
        </aside>

        {/* Viewport & Book Canvas Skeleton */}
        <main className="flex-1 h-full overflow-hidden p-6 flex flex-col items-center justify-center bg-[#F9F6F0]">
          <div className="relative w-full max-w-2xl h-[78vh] bg-white border border-[#E7E5E4] rounded-sm shadow-2xl p-10 flex flex-col justify-between overflow-hidden">
            <div className="absolute inset-0 skeleton-shimmer pointer-events-none" />
            <div className="space-y-4">
              <div className="h-6 w-1/3 bg-[#F4F0E8] rounded-md animate-pulse" />
              <div className="h-4 w-full bg-[#F4F0E8] rounded-md animate-pulse" />
              <div className="h-4 w-5/6 bg-[#F4F0E8] rounded-md animate-pulse" />
              <div className="h-4 w-4/5 bg-[#F4F0E8] rounded-md animate-pulse" />
              <div className="h-4 w-full bg-[#F4F0E8] rounded-md animate-pulse" />
            </div>
            <div className="space-y-3 my-auto py-6">
              <div className="h-4 w-11/12 bg-[#F4F0E8] rounded-md animate-pulse" />
              <div className="h-4 w-full bg-[#F4F0E8] rounded-md animate-pulse" />
              <div className="h-4 w-3/4 bg-[#F4F0E8] rounded-md animate-pulse" />
              <div className="h-4 w-5/6 bg-[#F4F0E8] rounded-md animate-pulse" />
            </div>
            <div className="flex items-center justify-center gap-3 pt-4 border-t border-[#F4F0E8]">
              <div className="w-5 h-5 border-2 border-[#C95A3B] border-t-transparent rounded-full animate-spin shrink-0" />
              <span className="font-serif text-sm font-semibold text-stone-700">Loading Leaflet Reader...</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
