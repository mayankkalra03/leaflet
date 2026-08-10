'use client';

import Link from 'next/link';
import { BookOpen, User, LogOut, Library, Bookmark, BarChart3 } from 'lucide-react';
import { useState, useEffect } from 'react';

export function Navbar() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : { user: null }))
      .then((data) => setUser(data.user))
      .catch(() => setUser(null));
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border-main)] bg-[var(--bg-main)]/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-[var(--text-main)] text-[var(--bg-main)] flex items-center justify-center transition-transform group-hover:scale-105">
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="font-serif-editorial text-2xl font-bold tracking-tight">
            leaflet
          </span>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--text-muted)]">
          <Link href="/dashboard" className="hover:text-[var(--text-main)] transition-colors flex items-center gap-1.5">
            <Library className="w-4 h-4" />
            Library
          </Link>
          <Link href="/notes" className="hover:text-[var(--text-main)] transition-colors flex items-center gap-1.5">
            <Bookmark className="w-4 h-4" />
            Notes Workspace
          </Link>
          <Link href="/stats" className="hover:text-[var(--text-main)] transition-colors flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4" />
            Statistics
          </Link>
        </nav>

        {/* Right CTA / Auth */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="hidden sm:flex items-center gap-2 text-sm font-medium text-[var(--text-main)] hover:opacity-80 transition-opacity"
              >
                <div className="w-7 h-7 rounded-full bg-[var(--accent-light)] text-[var(--accent-main)] font-semibold flex items-center justify-center text-xs border border-[var(--accent-main)]/20">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span>{user.name}</span>
              </Link>
              <button
                onClick={handleLogout}
                title="Log out"
                className="p-2 text-[var(--text-muted)] hover:text-[var(--text-main)] rounded-lg hover:bg-[var(--bg-card)] transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-medium text-[var(--text-main)] hover:text-[var(--accent-main)] transition-colors px-3 py-1.5"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="text-sm font-medium bg-[var(--text-main)] text-[var(--bg-main)] hover:bg-[var(--accent-main)] px-4 py-2 rounded-lg transition-all shadow-sm"
              >
                Start Reading
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
