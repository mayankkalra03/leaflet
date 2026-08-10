'use client';

import dynamic from 'next/dynamic';

const PdfReader = dynamic(
  () => import('./PdfReader').then((mod) => mod.PdfReader),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center space-y-4 font-sans text-stone-600">
        <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
        <p className="font-serif font-semibold text-lg text-stone-900">Loading Leaflet Reader...</p>
      </div>
    ),
  }
);

interface ClientPdfReaderProps {
  book: any;
}

export function ClientPdfReader({ book }: ClientPdfReaderProps) {
  return <PdfReader book={book} />;
}
