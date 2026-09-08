'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Flame,
  Highlighter,
  Bookmark,
  Smile,
  BarChart2,
  ArrowRight,
} from 'lucide-react';

interface StatsData {
  totalBooks: number;
  completedBooks: number;
  totalPagesRead: number;
  totalAnnotations: number;
  totalBookmarks: number;
  totalStickers: number;
  streakDays: number;
  totalMinutesRead: number;
  recentSessions: Array<{
    id: string;
    sessionDate: string;
    durationSeconds: number;
    pagesRead: number;
  }>;
}

export default function StatisticsPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats')
      .then((res) => (res.ok ? res.json() : { stats: null }))
      .then((data) => setStats(data.stats))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Header */}
        <div className="border-b border-[var(--border-main)] pb-6">
          <h1 className="font-serif-editorial text-3xl sm:text-4xl font-bold tracking-tight">
            Reading Statistics
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            An overview of your reading habits, pages completed, and thoughts recorded.
          </p>
        </div>

        {loading ? (
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
        ) : !stats ? (
          <div className="py-20 text-center text-sm text-[var(--text-muted)]">Could not load statistics.</div>
        ) : (
          <div className="space-y-8">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-main)] shadow-xs space-y-2">
                <div className="flex items-center justify-between text-[var(--text-muted)]">
                  <span className="text-xs font-semibold uppercase tracking-wider">Total Books</span>
                  <BookOpen className="w-4 h-4 text-[var(--accent-main)]" />
                </div>
                <div className="font-serif-editorial text-4xl font-bold">{stats.totalBooks}</div>
                <p className="text-xs text-[var(--text-muted)]">{stats.completedBooks} books finished</p>
              </div>

              <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-main)] shadow-xs space-y-2">
                <div className="flex items-center justify-between text-[var(--text-muted)]">
                  <span className="text-xs font-semibold uppercase tracking-wider">Pages Completed</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="font-serif-editorial text-4xl font-bold">{stats.totalPagesRead}</div>
                <p className="text-xs text-[var(--text-muted)]">rendered & read</p>
              </div>

              <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-main)] shadow-xs space-y-2">
                <div className="flex items-center justify-between text-[var(--text-muted)]">
                  <span className="text-xs font-semibold uppercase tracking-wider">Reading Streak</span>
                  <Flame className="w-4 h-4 text-amber-500" />
                </div>
                <div className="font-serif-editorial text-4xl font-bold text-amber-600">
                  {stats.streakDays} <span className="text-lg font-normal text-[var(--text-muted)]">days</span>
                </div>
                <p className="text-xs text-[var(--text-muted)]">Active daily reading streak</p>
              </div>

              <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-main)] shadow-xs space-y-2">
                <div className="flex items-center justify-between text-[var(--text-muted)]">
                  <span className="text-xs font-semibold uppercase tracking-wider">Reading Time</span>
                  <Clock className="w-4 h-4 text-sky-600" />
                </div>
                <div className="font-serif-editorial text-4xl font-bold">
                  {stats.totalMinutesRead} <span className="text-lg font-normal text-[var(--text-muted)]">mins</span>
                </div>
                <p className="text-xs text-[var(--text-muted)]">Total focus time</p>
              </div>
            </div>

            {/* Middle Section: Marginalia Breakdown & Recent Sessions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Marginalia Breakdown */}
              <div className="p-8 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-main)] shadow-xs space-y-6">
                <h3 className="font-serif-editorial text-2xl font-bold">Marginalia Breakdown</h3>
                <div className="space-y-4 text-sm">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-card)]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-yellow-100 text-yellow-800 flex items-center justify-center">
                        <Highlighter className="w-4 h-4" />
                      </div>
                      <span className="font-semibold">Highlights & Notes</span>
                    </div>
                    <span className="font-mono font-bold text-base">{stats.totalAnnotations}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-card)]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                        <Bookmark className="w-4 h-4" />
                      </div>
                      <span className="font-semibold">Bookmarks Saved</span>
                    </div>
                    <span className="font-mono font-bold text-base">{stats.totalBookmarks}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-card)]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center">
                        <Smile className="w-4 h-4" />
                      </div>
                      <span className="font-semibold">Page Stickers Placed</span>
                    </div>
                    <span className="font-mono font-bold text-base">{stats.totalStickers}</span>
                  </div>
                </div>
              </div>

              {/* Recent Sessions */}
              <div className="p-8 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-main)] shadow-xs space-y-6">
                <h3 className="font-serif-editorial text-2xl font-bold">Recent Reading Sessions</h3>
                {stats.recentSessions.length === 0 ? (
                  <p className="text-xs text-[var(--text-muted)] italic">No recent reading sessions recorded yet.</p>
                ) : (
                  <div className="space-y-3">
                    {stats.recentSessions.map((session) => (
                      <div
                        key={session.id}
                        className="flex items-center justify-between p-3 rounded-xl border border-[var(--border-main)] bg-[var(--bg-main)] text-xs"
                      >
                        <span className="font-mono text-[var(--text-muted)]">{session.sessionDate}</span>
                        <div className="flex items-center gap-4">
                          <span className="font-semibold">{session.pagesRead} pages</span>
                          <span className="px-2 py-0.5 rounded bg-stone-200 dark:bg-stone-800 font-mono">
                            {Math.round(session.durationSeconds / 60)} mins
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
