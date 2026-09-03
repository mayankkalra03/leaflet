'use client';

import { useState, useRef } from 'react';
import { Upload, X, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function UploadModal({ isOpen, onClose, onSuccess }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (selectedFile: File) => {
    setError('');
    if (!selectedFile.name.toLowerCase().endsWith('.pdf') && selectedFile.type !== 'application/pdf') {
      setError('Please select a valid PDF file.');
      return;
    }
    if (selectedFile.size > 50 * 1024 * 1024) {
      setError('File size must be under 50MB.');
      return;
    }

    setFile(selectedFile);
    if (!title) {
      setTitle(selectedFile.name.replace(/\.pdf$/i, ''));
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError('');

    try {
      // 1. Extract metadata from the PDF
      let totalPages = 1;
      let finalTitle = title.trim() || file.name.replace(/\.pdf$/i, '');
      let finalAuthor = author.trim() || 'Unknown Author';

      try {
        const { PDFDocument } = await import('pdf-lib');
        const buffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
        totalPages = pdfDoc.getPageCount();
        if (!title.trim() && pdfDoc.getTitle()) {
          finalTitle = pdfDoc.getTitle()!;
        }
        if (!author.trim() && pdfDoc.getAuthor()) {
          finalAuthor = pdfDoc.getAuthor()!;
        }
      } catch (pdfErr) {
        console.warn('PDF metadata extraction warning:', pdfErr);
      }

      // 2. Request a signed direct-upload URL (bypasses Vercel 4.5MB serverless limit)
      const urlRes = await fetch('/api/books/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name }),
      });

      if (urlRes.ok) {
        const { signedUrl, publicUrl } = await urlRes.json();

        // 3. Upload directly to Supabase Storage via signed URL
        const uploadFormData = new FormData();
        uploadFormData.append('cacheControl', '3600');
        uploadFormData.append('', file);

        const uploadRes = await fetch(signedUrl, {
          method: 'PUT',
          body: uploadFormData,
        });

        if (!uploadRes.ok) {
          throw new Error('Failed to upload file to cloud storage');
        }

        // 4. Save book record in database
        const bookRes = await fetch('/api/books', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileUrl: publicUrl,
            title: finalTitle,
            author: finalAuthor,
            totalPages,
            fileSize: file.size,
          }),
        });

        const bookData = await bookRes.json();
        if (!bookRes.ok) {
          throw new Error(bookData.error || 'Failed to save book record');
        }

        setLoading(false);
        onSuccess();
        onClose();
        return;
      }

      // Fallback for smaller files if signed URL endpoint fails
      if (file.size <= 4 * 1024 * 1024) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', finalTitle);
        formData.append('author', finalAuthor);

        const res = await fetch('/api/books', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Upload failed');
        }

        setLoading(false);
        onSuccess();
        onClose();
        return;
      }

      const urlData = await urlRes.json();
      throw new Error(urlData.error || 'Failed to initialize upload');
    } catch (err: any) {
      setError(err.message || 'Upload failed');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[var(--bg-surface)] w-full max-w-lg rounded-2xl border border-[var(--border-main)] shadow-2xl p-6 space-y-6 relative">
        <div className="flex items-center justify-between border-b border-[var(--border-main)] pb-4">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-[var(--accent-main)]" />
            <h2 className="font-serif-editorial text-2xl font-bold">Upload Digital Book / PDF</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-medium border border-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Dropzone */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-[var(--accent-main)] bg-[var(--accent-light)]'
                : file
                ? 'border-emerald-500 bg-emerald-50/30'
                : 'border-[var(--border-main)] hover:border-[var(--accent-main)] hover:bg-[var(--bg-card)]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            />

            {file ? (
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <p className="font-semibold text-sm text-[var(--text-main)] truncate max-w-xs mx-auto">
                  {file.name}
                </p>
                <p className="text-xs text-[var(--text-muted)] font-mono">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-xl bg-[var(--bg-card)] text-[var(--text-muted)] mx-auto flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <p className="font-semibold text-sm text-[var(--text-main)]">
                  Drag and drop your PDF book here
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  Or click to browse from your computer (Up to 50MB)
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">
              Book Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Meditations"
              className="w-full px-3.5 py-2 rounded-xl border border-[var(--border-main)] bg-[var(--bg-main)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-main)]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">
              Author
            </label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="e.g. Marcus Aurelius"
              className="w-full px-3.5 py-2 rounded-xl border border-[var(--border-main)] bg-[var(--bg-main)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-main)]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-main)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-[var(--text-muted)] hover:bg-[var(--bg-card)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!file || loading}
              className="px-6 py-2 rounded-xl text-sm font-semibold bg-[var(--text-main)] text-[var(--bg-main)] hover:bg-[var(--accent-main)] transition-colors shadow-sm disabled:opacity-50"
            >
              {loading ? 'Uploading PDF...' : 'Add to Library'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
