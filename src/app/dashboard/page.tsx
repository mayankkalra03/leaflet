'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { UploadModal } from '@/components/library/UploadModal';
import {
  BookOpen,
  Plus,
  Search,
  Star,
  Trash2,
  Edit2,
  Clock,
  ArrowRight,
  Grid,
  List,
  Filter,
  MoreVertical,
  Book,
  Sparkles,
} from 'lucide-react';

interface BookItem {
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
  fileUrl: string;
  fileSize: number;
  totalPages: number;
  isFavorite: boolean;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
  progress?: {
    currentPage: number;
    progressPercent: number;
    lastReadAt: string;
  } | null;
  _count?: {
    annotations: number;
    bookmarks: number;
    stickers: number;
  };
}

export default function DashboardPage() {
  const [books, setBooks] = useState<BookItem[]>([]);
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterFavorite, setFilterFavorite] = useState(false);
  const [sort, setSort] = useState<'recent' | 'title' | 'author'>('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<{ id: string; title: string; author: string } | null>(null);

  const fetchUserAndBooks = async () => {
    try {
      setLoading(true);
      const [meRes, booksRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch(`/api/books?search=${encodeURIComponent(search)}&favorite=${filterFavorite}&sort=${sort}`),
      ]);

      if (meRes.ok) {
        const meData = await meRes.json();
        setUser(meData.user);
      }

      if (booksRes.ok) {
        const booksData = await booksRes.json();
        setBooks(booksData.books || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserAndBooks();
  }, [search, filterFavorite, sort]);

  const handleToggleFavorite = async (id: string, currentFav: boolean) => {
    try {
      await fetch(`/api/books/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: !currentFav }),
      });
      fetchUserAndBooks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteBook = async (id: string) => {
    if (!confirm('Are you sure you want to delete this book from your library?')) return;
    try {
      await fetch(`/api/books/${id}`, { method: 'DELETE' });
      fetchUserAndBooks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateBook = async () => {
    if (!editingBook) return;
    try {
      await fetch(`/api/books/${editingBook.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editingBook.title,
          author: editingBook.author,
        }),
      });
      setEditingBook(null);
      fetchUserAndBooks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLaunchDemo = async () => {
    const res = await fetch('/api/seed-demo');
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    }
  };

  // Find Continue Reading Book (last read)
  const continueBook = books.length > 0 ? books[0] : null;

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Top Header Greeting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-main)] pb-6">
          <div>
            <h1 className="font-serif-editorial text-3xl sm:text-4xl font-bold tracking-tight">
              Welcome back, {user?.name || 'Reader'}
            </h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Your digital library workspace & active reading notes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleLaunchDemo}
              className="px-4 py-2.5 rounded-xl border border-[var(--border-main)] bg-[var(--bg-surface)] text-sm font-semibold hover:border-[var(--accent-main)] transition-colors shadow-sm flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-[var(--accent-main)]" />
              <span>Try Demo Book</span>
            </button>

            <button
              onClick={() => setIsUploadOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-[var(--text-main)] text-[var(--bg-main)] text-sm font-semibold hover:bg-[var(--accent-main)] transition-colors shadow-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Upload PDF</span>
            </button>
          </div>
        </div>

        {/* Continue Reading Hero Banner */}
        {continueBook && (
          <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-main)] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="flex items-center gap-6 w-full md:w-auto">
              {/* Cover Graphic */}
              <div className="w-20 h-28 sm:w-24 sm:h-32 rounded-lg bg-stone-900 text-stone-100 p-3 flex flex-col justify-between shrink-0 shadow-md border border-stone-800">
                <span className="text-[10px] font-serif-editorial text-amber-400 line-clamp-1">{continueBook.author}</span>
                <span className="font-serif-editorial text-sm font-bold leading-tight line-clamp-2">{continueBook.title}</span>
                <div className="flex items-center justify-between text-[10px] text-stone-400">
                  <span>PDF</span>
                  <span>{continueBook.totalPages}p</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--accent-light)] text-[var(--accent-main)] text-xs font-semibold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Continue Reading</span>
                </div>
                <h2 className="font-serif-editorial text-2xl font-bold">{continueBook.title}</h2>
                <p className="text-sm text-[var(--text-muted)]">by {continueBook.author}</p>

                {/* Progress Bar */}
                <div className="w-full sm:w-64 space-y-1 pt-1">
                  <div className="flex justify-between text-xs text-[var(--text-muted)] font-medium">
                    <span>Page {continueBook.progress?.currentPage || 1} of {continueBook.totalPages}</span>
                    <span>{Math.round(continueBook.progress?.progressPercent || 0)}%</span>
                  </div>
                  <div className="h-2 w-full bg-[var(--bg-main)] rounded-full overflow-hidden border border-[var(--border-main)]">
                    <div
                      className="h-full bg-[var(--accent-main)] rounded-full transition-all duration-300"
                      style={{ width: `${Math.max(continueBook.progress?.progressPercent || 0, 4)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <Link
              href={`/read/${continueBook.id}`}
              className="w-full md:w-auto px-6 py-3 rounded-xl bg-[var(--text-main)] text-[var(--bg-main)] font-semibold hover:bg-[var(--accent-main)] transition-colors shadow-md flex items-center justify-center gap-2 text-sm shrink-0"
            >
              <span>Resume Reading</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Toolbar & Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-[var(--text-muted)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title or author..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-[var(--border-main)] bg-[var(--bg-surface)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-main)]"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {/* Favorites Toggle */}
            <button
              onClick={() => setFilterFavorite(!filterFavorite)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-colors ${
                filterFavorite
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-[var(--bg-surface)] text-[var(--text-muted)] border-[var(--border-main)] hover:text-[var(--text-main)]'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${filterFavorite ? 'fill-amber-500 text-amber-500' : ''}`} />
              <span>Favorites Only</span>
            </button>

            {/* Sort Select */}
            <select
              value={sort}
              onChange={(e: any) => setSort(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs font-semibold border border-[var(--border-main)] bg-[var(--bg-surface)] text-[var(--text-main)] focus:outline-none"
            >
              <option value="recent">Recently Opened</option>
              <option value="title">Title (A-Z)</option>
              <option value="author">Author (A-Z)</option>
            </select>

            {/* View Mode */}
            <div className="flex items-center bg-[var(--bg-card)] rounded-xl p-1 border border-[var(--border-main)]">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg ${viewMode === 'grid' ? 'bg-[var(--bg-surface)] shadow-xs text-[var(--text-main)]' : 'text-[var(--text-muted)]'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg ${viewMode === 'list' ? 'bg-[var(--bg-surface)] shadow-xs text-[var(--text-main)]' : 'text-[var(--text-muted)]'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Books List Grid / Empty State */}
        {loading ? (
          <div className="py-20 text-center text-sm text-[var(--text-muted)]">Loading library...</div>
        ) : books.length === 0 ? (
          <div className="py-20 text-center max-w-md mx-auto space-y-4 rounded-2xl border border-dashed border-[var(--border-main)] p-8">
            <div className="w-12 h-12 rounded-xl bg-[var(--bg-card)] text-[var(--text-muted)] mx-auto flex items-center justify-center">
              <Book className="w-6 h-6" />
            </div>
            <h3 className="font-serif-editorial text-2xl font-bold">Your library is empty</h3>
            <p className="text-sm text-[var(--text-muted)]">
              Upload your first PDF book or open our built-in interactive demo volume to start reading.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={handleLaunchDemo}
                className="px-4 py-2 rounded-xl bg-[var(--text-main)] text-[var(--bg-main)] text-xs font-semibold hover:bg-[var(--accent-main)] transition-colors"
              >
                Open Demo Reader
              </button>
              <button
                onClick={() => setIsUploadOpen(true)}
                className="px-4 py-2 rounded-xl border border-[var(--border-main)] text-xs font-semibold hover:bg-[var(--bg-card)] transition-colors"
              >
                Upload PDF
              </button>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {books.map((book) => (
              <div
                key={book.id}
                className="group rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-main)] overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative"
              >
                {/* Book Header Cover Area */}
                <div className="p-5 bg-gradient-to-b from-[var(--bg-card)] to-[var(--bg-surface)] relative border-b border-[var(--border-main)]">
                  <div className="flex items-center justify-between mb-3">
                    <button
                      onClick={() => handleToggleFavorite(book.id, book.isFavorite)}
                      className="p-1.5 rounded-full hover:bg-[var(--bg-surface)] text-stone-400 hover:text-amber-500 transition-colors"
                    >
                      <Star className={`w-4 h-4 ${book.isFavorite ? 'fill-amber-500 text-amber-500' : ''}`} />
                    </button>
                    {book.isDemo && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-mono text-[10px] font-semibold">
                        DEMO
                      </span>
                    )}
                  </div>

                  <div className="w-24 h-36 mx-auto rounded-lg bg-stone-900 text-stone-100 p-3 flex flex-col justify-between shadow-md border border-stone-800 group-hover:scale-105 transition-transform">
                    <span className="text-[10px] font-serif-editorial text-amber-400 line-clamp-1">{book.author}</span>
                    <span className="font-serif-editorial text-sm font-bold leading-tight line-clamp-3">{book.title}</span>
                    <div className="flex items-center justify-between text-[10px] text-stone-400">
                      <span>PDF</span>
                      <span>{book.totalPages} pages</span>
                    </div>
                  </div>
                </div>

                {/* Info & Actions */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif-editorial text-lg font-bold text-[var(--text-main)] line-clamp-1">
                      {book.title}
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] line-clamp-1">by {book.author}</p>
                  </div>

                  {/* Progress & Stats */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                      <span>Page {book.progress?.currentPage || 1} / {book.totalPages}</span>
                      <span>{Math.round(book.progress?.progressPercent || 0)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-[var(--bg-card)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--accent-main)] rounded-full"
                        style={{ width: `${Math.max(book.progress?.progressPercent || 0, 3)}%` }}
                      />
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-2 flex items-center justify-between border-t border-[var(--border-main)] text-xs">
                    <Link
                      href={`/read/${book.id}`}
                      className="font-semibold text-[var(--accent-main)] hover:underline flex items-center gap-1"
                    >
                      <span>Read</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingBook({ id: book.id, title: book.title, author: book.author })}
                        className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-main)]"
                        title="Edit metadata"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteBook(book.id)}
                        className="p-1 rounded text-[var(--text-muted)] hover:text-red-600"
                        title="Delete book"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-main)] divide-y divide-[var(--border-main)] shadow-xs">
            {books.map((book) => (
              <div key={book.id} className="p-4 flex items-center justify-between gap-4 hover:bg-[var(--bg-card)] transition-colors">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleToggleFavorite(book.id, book.isFavorite)}
                    className="text-stone-400 hover:text-amber-500"
                  >
                    <Star className={`w-4 h-4 ${book.isFavorite ? 'fill-amber-500 text-amber-500' : ''}`} />
                  </button>

                  <div>
                    <h3 className="font-serif-editorial text-base font-bold text-[var(--text-main)]">
                      {book.title}
                    </h3>
                    <p className="text-xs text-[var(--text-muted)]">by {book.author} • {book.totalPages} pages</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="hidden sm:block text-right">
                    <span className="text-xs text-[var(--text-muted)] block font-mono">
                      Page {book.progress?.currentPage || 1} ({Math.round(book.progress?.progressPercent || 0)}%)
                    </span>
                  </div>

                  <Link
                    href={`/read/${book.id}`}
                    className="px-4 py-2 rounded-xl bg-[var(--text-main)] text-[var(--bg-main)] text-xs font-semibold hover:bg-[var(--accent-main)] transition-colors"
                  >
                    Read
                  </Link>

                  <button
                    onClick={() => handleDeleteBook(book.id)}
                    className="p-1 text-[var(--text-muted)] hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={fetchUserAndBooks}
      />

      {/* Rename Metadata Modal */}
      {editingBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-[var(--bg-surface)] p-6 rounded-2xl border border-[var(--border-main)] max-w-sm w-full space-y-4">
            <h3 className="font-serif-editorial text-xl font-bold">Edit Book Details</h3>
            <div>
              <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">Title</label>
              <input
                type="text"
                value={editingBook.title}
                onChange={(e) => setEditingBook({ ...editingBook, title: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[var(--border-main)] text-sm bg-[var(--bg-main)]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">Author</label>
              <input
                type="text"
                value={editingBook.author}
                onChange={(e) => setEditingBook({ ...editingBook, author: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[var(--border-main)] text-sm bg-[var(--bg-main)]"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingBook(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--text-muted)]"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateBook}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[var(--text-main)] text-[var(--bg-main)]"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
