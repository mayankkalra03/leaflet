'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import {
  BookOpen,
  Highlighter,
  FileText,
  Bookmark,
  Smile,
  Sparkles,
  ArrowRight,
  Sun,
  Moon,
  Search,
  CheckCircle2,
  Lock,
  Zap,
} from 'lucide-react';

export default function LandingPage() {
  const [isLaunchingDemo, setIsLaunchingDemo] = useState(false);

  const handleLaunchDemo = async () => {
    try {
      setIsLaunchingDemo(true);
      const res = await fetch('/api/seed-demo');
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error(err);
      setIsLaunchingDemo(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col font-sans">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Decorative Dashed Path Lines (Matching reference image) */}
        <svg
          className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 pointer-events-none opacity-40 z-0"
          viewBox="0 0 1000 400"
          fill="none"
        >
          <path
            d="M 100 80 Q 300 20 500 120 T 900 60"
            stroke="var(--text-muted)"
            strokeWidth="1.5"
            strokeDasharray="6 6"
          />
          <path
            d="M 50 300 Q 250 380 500 280 T 950 320"
            stroke="var(--text-muted)"
            strokeWidth="1.5"
            strokeDasharray="6 6"
          />
        </svg>

        {/* Floating Book Covers (Left & Right - Matching Reference Image) */}
        <div className="hidden lg:block absolute left-4 top-24 w-32 h-44 rounded-md shadow-xl bg-[var(--bg-card)] border border-[var(--border-main)] p-2 transition-all hover:scale-105 animate-float z-10">
          <div className="h-full w-full bg-stone-900 rounded text-stone-200 p-3 flex flex-col justify-between text-xs">
            <span className="font-serif-editorial text-sm text-amber-400">Stephen King</span>
            <span className="font-semibold text-stone-100">Fairy Tale</span>
            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-300">
              📖
            </div>
          </div>
        </div>

        <div className="hidden lg:block absolute right-8 top-16 w-36 h-48 rounded-md shadow-xl bg-[var(--bg-card)] border border-[var(--border-main)] p-2 transition-all hover:scale-105 animate-float delay-1000 z-10">
          <div className="h-full w-full bg-blue-950 rounded text-blue-100 p-3 flex flex-col justify-between text-xs">
            <span className="font-serif-editorial text-xs text-blue-300">F. Scott Fitzgerald</span>
            <span className="font-bold text-sm text-amber-200">The Great Gatsby</span>
            <div className="w-6 h-6 rounded bg-amber-400 text-stone-950 font-bold flex items-center justify-center text-[10px]">
              CLASSIC
            </div>
          </div>
        </div>

        <div className="relative z-10 text-center max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--bg-card)] border border-[var(--border-main)] text-xs font-medium text-[var(--accent-main)] mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Digital Reading Workspace</span>
          </div>

          {/* Editorial Headline */}
          <h1 className="font-serif-editorial text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[var(--text-main)] leading-[1.1] mb-6">
            Read your best <br />
            <span className="text-[var(--accent-main)] italic">books</span>
          </h1>

          <p className="text-lg sm:text-xl text-[var(--text-muted)] max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            A quieter space for the books and ideas worth keeping. Highlight passages, attach thoughts, place stickers, and build your digital library.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[var(--text-main)] text-[var(--bg-main)] font-semibold hover:bg-[var(--accent-main)] transition-all shadow-md flex items-center justify-center gap-2 group text-base"
            >
              <span>Start Reading Free</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <button
              onClick={handleLaunchDemo}
              disabled={isLaunchingDemo}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[var(--bg-surface)] text-[var(--text-main)] font-semibold border border-[var(--border-main)] hover:border-[var(--accent-main)] transition-all shadow-sm flex items-center justify-center gap-2 text-base"
            >
              <BookOpen className="w-4 h-4 text-[var(--accent-main)]" />
              <span>{isLaunchingDemo ? 'Opening Demo...' : 'Explore Demo Reader'}</span>
            </button>
          </div>
        </div>

        {/* Product Visual Mockup Frame (Matching attached reference tablet reader layout) */}
        <div className="mt-16 relative max-w-5xl mx-auto rounded-2xl p-3 sm:p-4 bg-[var(--bg-card)] border border-[var(--border-main)] shadow-2xl overflow-hidden">
          <div className="rounded-xl overflow-hidden border border-[var(--border-main)] bg-[var(--bg-surface)] shadow-inner">
            {/* Tablet Mockup Top Header Bar */}
            <div className="h-11 bg-stone-100 border-b border-stone-200 px-4 flex items-center justify-between text-xs text-stone-500 font-medium">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-stone-300"></div>
                <div className="w-3 h-3 rounded-full bg-stone-300"></div>
                <div className="w-3 h-3 rounded-full bg-stone-300"></div>
                <span className="ml-2 font-semibold text-stone-700">Leaflet Reader</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-mono text-[11px]">Chapter I • Page 1 of 3</span>
                <span className="text-stone-400">100% Fit Width</span>
              </div>
            </div>

            {/* Mockup Inner Split Content */}
            <div className="grid grid-cols-1 md:grid-cols-12 min-h-[420px]">
              {/* Sidebar Mockup */}
              <div className="md:col-span-4 border-r border-stone-200 p-4 bg-stone-50/50 hidden md:block">
                <div className="relative mb-4">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                  <input
                    type="text"
                    readOnly
                    value="Search library..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-stone-200 bg-white text-stone-400 cursor-default"
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-2">Outline / Chapters</span>
                    <div className="space-y-1 text-xs">
                      <div className="px-2.5 py-1.5 rounded bg-amber-100/70 text-amber-900 font-medium">
                        Chapter I: The Lost Art of Focused Attention
                      </div>
                      <div className="px-2.5 py-1.5 rounded hover:bg-stone-100 text-stone-600">
                        Chapter II: Marginalia and the Thinking Mind
                      </div>
                      <div className="px-2.5 py-1.5 rounded hover:bg-stone-100 text-stone-600">
                        Chapter III: Architectures of Digital Peace
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-2">Annotations (2)</span>
                    <div className="p-2.5 rounded-lg border border-amber-200 bg-amber-50/80 text-xs text-amber-900 space-y-1">
                      <div className="flex items-center justify-between font-semibold text-[11px]">
                        <span>Page 1</span>
                        <span className="text-amber-700">Highlight</span>
                      </div>
                      <p className="italic text-[11px] line-clamp-2">"deep reading is not merely decoding symbols on a page..."</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* PDF Page Mockup Area */}
              <div className="md:col-span-8 p-6 md:p-8 bg-[#FAF8F5] relative flex flex-col justify-between">
                {/* Floating Highlight Toolbar Mockup */}
                <div className="absolute top-6 right-8 bg-stone-900 text-white rounded-lg shadow-xl px-3 py-1.5 flex items-center gap-2 text-xs z-20 animate-bounce">
                  <div className="w-3 h-3 rounded-full bg-yellow-400 ring-2 ring-white"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                  <div className="w-3 h-3 rounded-full bg-sky-400"></div>
                  <span className="h-4 w-px bg-stone-700 mx-1"></span>
                  <span className="text-stone-300 hover:text-white cursor-default">Add Note</span>
                </div>

                {/* Floating Sticker Mockup */}
                <div className="absolute top-28 right-12 text-3xl animate-pulse">
                  💡
                </div>

                <div className="max-w-xl mx-auto space-y-4 text-stone-800">
                  <span className="text-xs font-semibold text-amber-700 uppercase tracking-widest block">CHAPTER I</span>
                  <h2 className="font-serif-editorial text-2xl font-bold text-stone-900">
                    The Lost Art of Focused Attention
                  </h2>
                  <p className="text-sm leading-relaxed text-stone-700">
                    In an era defined by relentless notifications and hyper-abundant information, true reading has become a quiet act of rebellion.
                  </p>
                  <p className="text-sm leading-relaxed bg-yellow-100/80 p-1.5 rounded border-l-2 border-yellow-500 font-serif-editorial text-stone-900">
                    "Deep reading is not merely decoding symbols on a page; it is a contemplative practice that alters the structure of thought."
                  </p>
                  <p className="text-sm leading-relaxed text-stone-700">
                    As Jorge Luis Borges once wrote, "I have always imagined that Paradise will be a kind of library."
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-stone-200/80 flex items-center justify-between text-xs text-stone-400">
                  <span>Leaflet Reader Workspace</span>
                  <span>100% Client Rendering</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- DARK SHOWCASE SECTION (STATISTICS & CAPABILITIES) --- */}
      <section className="bg-[#121110] text-[#F5F4F0] py-20 px-4 sm:px-6 lg:px-8 border-t border-b border-stone-800">
        <div className="max-w-7xl mx-auto">
          {/* Stats Bar (Matching bottom section of reference design) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center pb-16 border-b border-stone-800">
            <div>
              <span className="font-serif-editorial text-5xl md:text-6xl font-bold text-amber-400 block mb-2">
                100k+
              </span>
              <p className="text-stone-400 text-sm font-medium">Pages rendered with smooth PDF virtualization</p>
            </div>
            <div>
              <span className="font-serif-editorial text-5xl md:text-6xl font-bold text-amber-400 block mb-2">
                100%
              </span>
              <p className="text-stone-400 text-sm font-medium">Private server authorization & user ownership</p>
            </div>
            <div>
              <span className="font-serif-editorial text-5xl md:text-6xl font-bold text-amber-400 block mb-2">
                0
              </span>
              <p className="text-stone-400 text-sm font-medium">Distractions, social clutter, or ad trackers</p>
            </div>
          </div>

          {/* Capability Explanation Grid */}
          <div className="pt-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="font-serif-editorial text-3xl sm:text-4xl font-bold leading-tight">
                What can you do with Leaflet?
              </h2>
              <ul className="space-y-4 text-stone-300 text-base">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Highlight & Annotate:</strong> Select any passage to highlight in vibrant colors and attach sticky notes.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Interactive Page Stickers:</strong> Place ⭐ ❤️ 💡 🔥 📌 stickers anywhere on pages to flag key insights.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Instant Search & TOC:</strong> Search through entire PDF text with highlighted snippets and TOC outline navigation.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Notes Workspace & Export:</strong> Centralize thoughts across all your books and export as Markdown or JSON.</span>
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between text-xs text-stone-400 border-b border-stone-800 pb-3">
                <span className="font-mono text-amber-400">PDF Reader Canvas Engine</span>
                <span>Sepia / Dark / Light Themes</span>
              </div>
              <p className="font-serif-editorial text-lg text-amber-100 italic leading-relaxed">
                "Books are a uniquely portable magic. Leaflet gives that magic a quiet home."
              </p>
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-stone-400">Auto-saved Reading Progress</span>
                <span className="px-2.5 py-1 rounded bg-stone-800 text-amber-300 text-xs font-medium">
                  Resume Anywhere
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURES SHOWCASE GRID --- */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-serif-editorial text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Everything you need to read deeply
          </h2>
          <p className="text-lg text-[var(--text-muted)]">
            Built for readers, researchers, and thinkers who demand quiet quality.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-main)] space-y-4 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Highlighter className="w-6 h-6" />
            </div>
            <h3 className="font-serif-editorial text-2xl font-bold">Contextual Highlighting</h3>
            <p className="text-[var(--text-muted)] text-sm leading-relaxed">
              Highlight text in five distinct colors. Attach detailed notes to passages and jump back to exact offsets whenever you return.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-main)] space-y-4 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center">
              <Smile className="w-6 h-6" />
            </div>
            <h3 className="font-serif-editorial text-2xl font-bold">Interactive Stickers</h3>
            <p className="text-[var(--text-muted)] text-sm leading-relaxed">
              Place, move, scale, and rotate emoji stickers directly on PDF canvas pages to visibly mark your emotional reactions and key ideas.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-main)] space-y-4 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-serif-editorial text-2xl font-bold">Notes Workspace</h3>
            <p className="text-[var(--text-muted)] text-sm leading-relaxed">
              A dedicated central workspace bringing together all extracted quotes, notes, and highlights from every book in your collection.
            </p>
          </div>
        </div>
      </section>

      {/* --- FINAL CTA BANNER --- */}
      <section className="pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="rounded-3xl bg-stone-900 text-[#F5F4F0] p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
          <div className="space-y-4 max-w-xl z-10">
            <h2 className="font-serif-editorial text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
              A Million Books In Your Pocket
            </h2>
            <p className="text-stone-300 text-base">
              Upload your own PDFs, build your digital library, and experience reading without noise.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 z-10 w-full md:w-auto">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[var(--accent-main)] text-white font-semibold hover:bg-[var(--accent-hover)] transition-all shadow-lg text-center"
            >
              Create Account
            </Link>
            <button
              onClick={handleLaunchDemo}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-stone-800 text-stone-200 font-semibold border border-stone-700 hover:bg-stone-700 transition-all text-center"
            >
              Try Demo Reader
            </button>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="mt-auto border-t border-[var(--border-main)] bg-[var(--bg-surface)] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[var(--accent-main)]" />
            <span className="font-serif-editorial font-bold text-sm text-[var(--text-main)]">leaflet</span>
            <span>— Read. Mark. Remember.</span>
          </div>
          <p>© {new Date().getFullYear()} Leaflet Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
