'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import {
  FileText,
  Search,
  Download,
  BookOpen,
  ArrowRight,
  Trash2,
  Highlighter,
  Filter,
  Bookmark,
  Share2,
} from 'lucide-react';

interface NoteItem {
  id: string;
  pageNumber: number;
  selectedText: string;
  color: string;
  note?: string | null;
  type: string;
  createdAt: string;
  book: {
    id: string;
    title: string;
    author: string;
  };
}

export default function NotesWorkspacePage() {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedBookFilter, setSelectedBookFilter] = useState('');

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/notes?search=${encodeURIComponent(search)}&bookId=${selectedBookFilter}`);
      if (res.ok) {
        const data = await res.json();
        setNotes(data.notes || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [search, selectedBookFilter]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    try {
      await fetch(`/api/annotations?id=${id}`, { method: 'DELETE' });
      fetchNotes();
    } catch (err) {
      console.error(err);
    }
  };

  // Export as Markdown
  const exportMarkdown = () => {
    let md = `# Leaflet Notes & Highlights Export\n\nGenerated on ${new Date().toLocaleDateString()}\n\n`;

    const booksMap: Record<string, NoteItem[]> = {};
    notes.forEach((n) => {
      const key = n.book.title;
      if (!booksMap[key]) booksMap[key] = [];
      booksMap[key].push(n);
    });

    Object.entries(booksMap).forEach(([bookTitle, items]) => {
      md += `## ${bookTitle}\n`;
      items.forEach((item) => {
        md += `> "${item.selectedText}" (Page ${item.pageNumber})\n`;
        if (item.note) {
          md += `*Note:* ${item.note}\n`;
        }
        md += `\n`;
      });
      md += `\n---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leaflet-notes-export-${Date.now()}.md`;
    a.click();
  };

  // Export as JSON
  const exportJson = () => {
    const jsonStr = JSON.stringify(notes, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leaflet-notes-export-${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-main)] pb-6">
          <div>
            <h1 className="font-serif-editorial text-3xl sm:text-4xl font-bold tracking-tight">
              Notes Workspace
            </h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              All extracted thoughts, highlights, and marginalia across your library.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={exportMarkdown}
              className="px-4 py-2.5 rounded-xl border border-[var(--border-main)] bg-[var(--bg-surface)] text-sm font-semibold hover:border-[var(--accent-main)] transition-colors shadow-sm flex items-center gap-2"
            >
              <Download className="w-4 h-4 text-[var(--accent-main)]" />
              <span>Export Markdown</span>
            </button>

            <button
              onClick={exportJson}
              className="px-4 py-2.5 rounded-xl bg-[var(--text-main)] text-[var(--bg-main)] text-sm font-semibold hover:bg-[var(--accent-main)] transition-colors shadow-sm flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-[var(--text-muted)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search thoughts or quotes..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-[var(--border-main)] bg-[var(--bg-surface)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-main)]"
            />
          </div>

          <div className="text-xs text-[var(--text-muted)] font-mono">
            {notes.length} total entries
          </div>
        </div>

        {/* Notes Grid / List */}
        {loading ? (
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
        ) : notes.length === 0 ? (
          <div className="py-20 text-center max-w-md mx-auto space-y-4 rounded-2xl border border-dashed border-[var(--border-main)] p-8">
            <div className="w-12 h-12 rounded-xl bg-[var(--bg-card)] text-[var(--text-muted)] mx-auto flex items-center justify-center">
              <Highlighter className="w-6 h-6" />
            </div>
            <h3 className="font-serif-editorial text-2xl font-bold">No notes found</h3>
            <p className="text-sm text-[var(--text-muted)]">
              When you highlight text or write sticky notes in the PDF reader, they will appear here automatically.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--text-main)] text-[var(--bg-main)] text-xs font-semibold hover:bg-[var(--accent-main)] transition-colors"
            >
              Open Library
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note) => (
              <div
                key={note.id}
                className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-main)] shadow-xs hover:shadow-lg transition-all space-y-4 flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold font-serif-editorial text-[var(--accent-main)]">
                      {note.book.title}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[var(--bg-card)] text-[10px] font-mono font-bold text-[var(--text-muted)]">
                      Page {note.pageNumber}
                    </span>
                  </div>

                  <p className="font-serif-editorial italic text-base leading-relaxed p-3 rounded-xl bg-[var(--bg-card)] text-[var(--text-main)] border-l-3 border-amber-400">
                    "{note.selectedText}"
                  </p>

                  {note.note && (
                    <div className="text-xs text-[var(--text-muted)] space-y-1">
                      <span className="font-semibold text-[var(--text-main)] uppercase tracking-wider text-[10px] block">
                        My Thought:
                      </span>
                      <p className="bg-[var(--bg-main)] p-2.5 rounded-lg border border-[var(--border-main)]">
                        {note.note}
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-[var(--border-main)] flex items-center justify-between text-xs">
                  <Link
                    href={`/read/${note.book.id}`}
                    className="font-semibold text-[var(--accent-main)] hover:underline flex items-center gap-1"
                  >
                    <span>Jump to Book</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    onClick={() => handleDelete(note.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-[var(--text-muted)] hover:text-red-600 transition-opacity"
                    title="Delete Note"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
