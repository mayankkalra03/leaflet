'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, ArrowRight, Lock, Mail, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-[var(--text-main)] text-[var(--bg-main)] flex items-center justify-center transition-transform group-hover:scale-105 shadow-md">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="font-serif-editorial text-3xl font-bold tracking-tight">leaflet</span>
          </Link>
          <h1 className="font-serif-editorial text-3xl font-bold tracking-tight text-[var(--text-main)]">
            Welcome back
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Sign in to access your digital library and reading notes.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-[var(--bg-surface)] p-8 rounded-2xl border border-[var(--border-main)] shadow-xl space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 text-red-700 text-xs font-medium border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-[var(--text-muted)]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="reader@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border-main)] bg-[var(--bg-main)] text-sm text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-main)] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-[var(--text-muted)]" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border-main)] bg-[var(--bg-main)] text-sm text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-main)] transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-[var(--text-main)] text-[var(--bg-main)] font-semibold hover:bg-[var(--accent-main)] transition-all shadow-md flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              <span>{loading ? 'Signing in...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-[var(--text-muted)]">
          Don't have an account?{' '}
          <Link href="/register" className="font-semibold text-[var(--accent-main)] hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
