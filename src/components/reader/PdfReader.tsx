'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import * as pdfjsLib from 'pdfjs-dist';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Sun,
  Moon,
  Bookmark,
  Highlighter,
  Search,
  List,
  Smile,
  HelpCircle,
  X,
  FileText,
  Trash2,
  Plus,
  Check,
  RotateCw,
  ExternalLink,
} from 'lucide-react';

// Configure pdfjs worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

interface AnnotationItem {
  id: string;
  pageNumber: number;
  selectedText: string;
  color: string;
  note?: string | null;
  type: string;
  createdAt: string;
}

interface BookmarkItem {
  id: string;
  pageNumber: number;
  title?: string | null;
}

interface StickerItem {
  id: string;
  pageNumber: number;
  emoji: string;
  xPercent: number;
  yPercent: number;
  scale: number;
  rotation: number;
}

interface TocItem {
  title: string;
  pageNumber: number;
  items?: TocItem[];
}

interface SearchResult {
  pageNumber: number;
  snippet: string;
}

interface PdfReaderProps {
  book: {
    id: string;
    title: string;
    author: string;
    fileUrl: string;
    totalPages: number;
    progress?: {
      currentPage: number;
      progressPercent: number;
    } | null;
  };
}

const EMOJI_STICKERS = ['⭐', '❤️', '💡', '🔥', '❗', '🤔', '😂', '📌'];
const HIGHLIGHT_COLORS = [
  { name: 'Yellow', value: '#fef08a', class: 'bg-yellow-300' },
  { name: 'Green', value: '#bbf7d0', class: 'bg-green-300' },
  { name: 'Blue', value: '#bfdbfe', class: 'bg-blue-300' },
  { name: 'Pink', value: '#fbcfe8', class: 'bg-pink-300' },
  { name: 'Orange', value: '#fed7aa', class: 'bg-orange-300' },
];

export function PdfReader({ book }: PdfReaderProps) {
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [numPages, setNumPages] = useState(book.totalPages || 1);
  const [currentPage, setCurrentPage] = useState(book.progress?.currentPage || 1);
  const [scale, setScale] = useState(1.1);
  const [fitMode, setFitMode] = useState<'width' | 'page' | 'custom'>('width');
  const [readerTheme, setReaderTheme] = useState<'light' | 'sepia' | 'dark'>('light');

  // Sidebar & Modals
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'toc' | 'annotations' | 'search' | 'stickers'>('toc');
  const [helpOpen, setHelpOpen] = useState(false);

  // Annotations / Bookmarks / Stickers Data
  const [annotations, setAnnotations] = useState<AnnotationItem[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [stickers, setStickers] = useState<StickerItem[]>([]);
  const [toc, setToc] = useState<TocItem[]>([]);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Text Selection State
  const [selection, setSelection] = useState<{
    text: string;
    x: number;
    y: number;
    pageNumber: number;
  } | null>(null);
  const [noteInput, setNoteInput] = useState('');
  const [showNoteField, setShowNoteField] = useState(false);
  const [showAddPageNote, setShowAddPageNote] = useState(false);
  const [pageNoteText, setPageNoteText] = useState('');
  const [pageNoteColor, setPageNoteColor] = useState('#fef08a');

  // Canvas & Layer Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const textLayerRef = useRef<HTMLDivElement | null>(null);
  const annotationLayerRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pageContainerRef = useRef<HTMLDivElement | null>(null);
  const currentRenderTaskRef = useRef<any>(null);
  const currentTextLayerTaskRef = useRef<any>(null);
  const [hasTextContent, setHasTextContent] = useState(true);
  const [textLayerReadyKey, setTextLayerReadyKey] = useState(0);

  // Load PDF Document
  useEffect(() => {
    let isMounted = true;
    const loadingTask = pdfjsLib.getDocument(book.fileUrl);

    loadingTask.promise.then(
      async (doc) => {
        if (!isMounted) return;
        setPdfDoc(doc);
        setNumPages(doc.numPages);

        // Extract TOC Outline
        try {
          const outline = await doc.getOutline();
          if (outline && outline.length > 0) {
            const extractItems = async (items: any[]): Promise<TocItem[]> => {
              const result: TocItem[] = [];
              for (const item of items) {
                let pageNumber = 1;
                if (item.dest) {
                  try {
                    const destRef = typeof item.dest === 'string' ? await doc.getDestination(item.dest) : item.dest;
                    if (Array.isArray(destRef) && destRef[0]) {
                      const destIndex = await doc.getPageIndex(destRef[0]);
                      pageNumber = destIndex + 1;
                    }
                  } catch {
                    // Fallback
                  }
                }
                if (item.title) {
                  result.push({ title: item.title, pageNumber });
                }
                if (item.items && item.items.length > 0) {
                  const children = await extractItems(item.items);
                  result.push(...children);
                }
              }
              return result;
            };

            const parsedToc = await extractItems(outline);
            // Sort chronologically by page number so TOC matches actual reading order
            parsedToc.sort((a, b) => a.pageNumber - b.pageNumber);
            setToc(parsedToc);
          }
        } catch (e) {
          console.warn('Could not extract TOC outline:', e);
        }
      },
      (err) => console.error('PDF load error:', err)
    );

    return () => {
      isMounted = false;
    };
  }, [book.fileUrl]);

  // Fetch saved Annotations, Bookmarks & Stickers
  const fetchReaderData = useCallback(async () => {
    try {
      const [annRes, bmRes, stRes] = await Promise.all([
        fetch(`/api/annotations?bookId=${book.id}`),
        fetch(`/api/bookmarks?bookId=${book.id}`),
        fetch(`/api/stickers?bookId=${book.id}`),
      ]);

      if (annRes.ok) {
        const data = await annRes.json();
        setAnnotations(data.annotations || []);
      }
      if (bmRes.ok) {
        const data = await bmRes.json();
        setBookmarks(data.bookmarks || []);
      }
      if (stRes.ok) {
        const data = await stRes.json();
        setStickers(data.stickers || []);
      }
    } catch (err) {
      console.error(err);
    }
  }, [book.id]);

  useEffect(() => {
    fetchReaderData();
  }, [fetchReaderData]);

  // Save Progress on Page Change
  useEffect(() => {
    if (!book.id) return;
    const percent = ((currentPage - 1) / Math.max(numPages - 1, 1)) * 100;
    const timer = setTimeout(() => {
      fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId: book.id,
          currentPage,
          progressPercent: percent,
        }),
      }).catch(console.error);
    }, 800);

    return () => clearTimeout(timer);
  }, [currentPage, numPages, book.id]);

  // Render Page to Canvas
  const renderPage = useCallback(
    async (pageNumber: number) => {
      if (!pdfDoc || !canvasRef.current || !textLayerRef.current) return;

      // Cancel previous ongoing operations
      if (currentRenderTaskRef.current) {
        try {
          currentRenderTaskRef.current.cancel();
        } catch {
          // ignore
        }
        currentRenderTaskRef.current = null;
      }

      if (currentTextLayerTaskRef.current) {
        try {
          currentTextLayerTaskRef.current.cancel();
        } catch {
          // ignore
        }
        currentTextLayerTaskRef.current = null;
      }

      try {
        const page = await pdfDoc.getPage(pageNumber);
        const viewport = page.getViewport({ scale });

        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext('2d');

        if (!context) return;

        // High DPI Support
        const outputScale = window.devicePixelRatio || 1;
        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;

        const renderTask = page.render({
          canvasContext: context,
          transform: transform || undefined,
          viewport,
        });

        currentRenderTaskRef.current = renderTask;

        try {
          await renderTask.promise;
        } catch (renderErr: any) {
          if (renderErr?.name === 'RenderingCancelledException') {
            return;
          }
          throw renderErr;
        } finally {
          if (currentRenderTaskRef.current === renderTask) {
            currentRenderTaskRef.current = null;
          }
        }

        // Render Text Layer for Text Selection
        const textLayerDiv = textLayerRef.current;
        if (textLayerDiv) {
          textLayerDiv.innerHTML = '';
          textLayerDiv.style.width = `${Math.floor(viewport.width)}px`;
          textLayerDiv.style.height = `${Math.floor(viewport.height)}px`;
          textLayerDiv.style.setProperty('--scale-factor', `${viewport.scale}`);

          const textContent = await page.getTextContent();
          const hasText = textContent.items && textContent.items.length > 0;
          setHasTextContent(hasText);

          if (hasText) {
            const textTask = pdfjsLib.renderTextLayer({
              textContentSource: textContent,
              container: textLayerDiv,
              viewport,
              textDivs: [],
            });
            currentTextLayerTaskRef.current = textTask;
            await textTask.promise;
            setTextLayerReadyKey((k) => k + 1);
          }
        }

        // Render Annotation Layer for Clickable Links
        const annotationLayerDiv = annotationLayerRef.current;
        if (annotationLayerDiv) {
          annotationLayerDiv.innerHTML = '';
          annotationLayerDiv.style.width = `${Math.floor(viewport.width)}px`;
          annotationLayerDiv.style.height = `${Math.floor(viewport.height)}px`;

          const annotations = await page.getAnnotations();
          for (const item of annotations) {
            if (item.subtype === 'Link' && item.rect) {
              const rect = viewport.convertToViewportRectangle(item.rect);
              const minX = Math.min(rect[0], rect[2]);
              const minY = Math.min(rect[1], rect[3]);
              const width = Math.abs(rect[2] - rect[0]);
              const height = Math.abs(rect[3] - rect[1]);

              const linkEl = document.createElement('a');
              linkEl.style.position = 'absolute';
              linkEl.style.left = `${minX}px`;
              linkEl.style.top = `${minY}px`;
              linkEl.style.width = `${width}px`;
              linkEl.style.height = `${height}px`;
              linkEl.style.display = 'block';
              linkEl.style.cursor = 'pointer';
              linkEl.style.zIndex = '10';
              linkEl.className = 'hover:bg-blue-500/15 rounded-xs transition-colors';

              if (item.url) {
                linkEl.href = item.url;
                linkEl.target = '_blank';
                linkEl.rel = 'noopener noreferrer';
                linkEl.title = `Open link: ${item.url}`;
              } else if (item.dest) {
                linkEl.title = 'Jump to section';
                linkEl.onclick = async (e) => {
                  e.preventDefault();
                  try {
                    const destRef = typeof item.dest === 'string' ? await pdfDoc.getDestination(item.dest) : item.dest;
                    if (Array.isArray(destRef) && destRef[0]) {
                      const destIndex = await pdfDoc.getPageIndex(destRef[0]);
                      setCurrentPage(destIndex + 1);
                    }
                  } catch (err) {
                    console.warn('Destination jump error:', err);
                  }
                };
              }

              annotationLayerDiv.appendChild(linkEl);
            }
          }
        }
      } catch (err: any) {
        if (err?.name !== 'RenderingCancelledException') {
          console.error('Render page error:', err);
        }
      }
    },
    [pdfDoc, scale]
  );

  useEffect(() => {
    renderPage(currentPage);
    return () => {
      if (currentRenderTaskRef.current) {
        try {
          currentRenderTaskRef.current.cancel();
        } catch {
          // ignore
        }
      }
      if (currentTextLayerTaskRef.current) {
        try {
          currentTextLayerTaskRef.current.cancel();
        } catch {
          // ignore
        }
      }
    };
  }, [currentPage, renderPage]);

  // Visually highlight saved passages in text layer across single and multi-line spans
  useEffect(() => {
    const textLayerDiv = textLayerRef.current;
    if (!textLayerDiv) return;

    const pageAnns = annotations.filter((a) => a.pageNumber === currentPage);
    const spans = Array.from(textLayerDiv.querySelectorAll('span'));
    if (spans.length === 0) return;

    // Restore original text content to clear previous marks
    spans.forEach((span) => {
      if (span.dataset.rawText !== undefined) {
        span.textContent = span.dataset.rawText;
      } else {
        span.dataset.rawText = span.textContent || '';
      }
    });

    if (pageAnns.length === 0) return;

    const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const normalizeForSearch = (str: string) =>
      str
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/\u00A0/g, ' ');

    // Build contiguous representation of page text across all spans
    let combinedText = '';
    const charMap: Array<{ spanIndex: number; charIndex: number } | null> = [];

    for (let sIdx = 0; sIdx < spans.length; sIdx++) {
      const span = spans[sIdx];
      const raw = span.dataset.rawText || '';
      if (!raw) continue;

      if (combinedText.length > 0 && !/\s$/.test(combinedText) && !/^\s/.test(raw)) {
        combinedText += ' ';
        charMap.push(null);
      }

      for (let cIdx = 0; cIdx < raw.length; cIdx++) {
        combinedText += raw[cIdx];
        charMap.push({ spanIndex: sIdx, charIndex: cIdx });
      }
    }

    if (!combinedText) return;

    const normCombined = normalizeForSearch(combinedText);
    const usedRanges: Array<{ start: number; end: number }> = [];
    const spanIntervals = new Map<number, Array<{ start: number; end: number; color: string }>>();

    pageAnns.forEach((ann) => {
      const target = ann.selectedText?.trim();
      if (!target || target.toLowerCase() === 'page note' || target.startsWith('Note on Page')) return;

      const normTarget = normalizeForSearch(target);
      const tokens = normTarget.split(/\s+/).filter(Boolean);
      if (tokens.length === 0) return;

      const isSingleWord = tokens.length === 1 && /^[\w'-]+$/u.test(tokens[0]);
      const pattern = isSingleWord
        ? `\\b(${escapeRegExp(tokens[0])})\\b`
        : tokens.map((t) => escapeRegExp(t)).join('\\s+');

      let regex: RegExp;
      try {
        regex = new RegExp(pattern, 'gi');
      } catch {
        return;
      }

      let match: RegExpExecArray | null = null;
      let chosenMatch: RegExpExecArray | null = null;

      while ((match = regex.exec(normCombined)) !== null) {
        const start = match.index;
        const end = start + match[0].length;
        const alreadyUsed = usedRanges.some((r) => Math.max(r.start, start) < Math.min(r.end, end));
        if (!alreadyUsed) {
          chosenMatch = match;
          break;
        }
        if (!chosenMatch) {
          chosenMatch = match;
        }
      }

      if (!chosenMatch) return;

      const matchStart = chosenMatch.index;
      const matchEnd = matchStart + chosenMatch[0].length;
      usedRanges.push({ start: matchStart, end: matchEnd });

      let currentSpan = -1;
      let rangeStart = -1;
      let rangeEnd = -1;

      const flush = () => {
        if (currentSpan !== -1 && rangeStart !== -1 && rangeEnd > rangeStart) {
          if (!spanIntervals.has(currentSpan)) {
            spanIntervals.set(currentSpan, []);
          }
          spanIntervals.get(currentSpan)!.push({
            start: rangeStart,
            end: rangeEnd,
            color: ann.color || '#fef08a',
          });
        }
      };

      for (let k = matchStart; k < matchEnd; k++) {
        const m = charMap[k];
        if (m) {
          if (m.spanIndex !== currentSpan) {
            flush();
            currentSpan = m.spanIndex;
            rangeStart = m.charIndex;
            rangeEnd = m.charIndex + 1;
          } else {
            if (m.charIndex === rangeEnd) {
              rangeEnd = m.charIndex + 1;
            } else {
              flush();
              rangeStart = m.charIndex;
              rangeEnd = m.charIndex + 1;
            }
          }
        }
      }
      flush();
    });

    const escapeHtml = (str: string) =>
      str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

    for (const [sIdx, intervals] of spanIntervals.entries()) {
      const span = spans[sIdx];
      if (!span) continue;
      const raw = span.dataset.rawText || '';
      if (!raw) continue;

      intervals.sort((a, b) => a.start - b.start);

      // Merge / clip overlaps
      const merged: Array<{ start: number; end: number; color: string }> = [];
      for (const iv of intervals) {
        if (merged.length === 0) {
          merged.push({ ...iv });
        } else {
          const prev = merged[merged.length - 1];
          if (iv.start < prev.end) {
            if (iv.end > prev.end) {
              merged.push({ start: prev.end, end: iv.end, color: iv.color });
            }
          } else {
            merged.push({ ...iv });
          }
        }
      }

      let html = '';
      let lastIdx = 0;
      for (const iv of merged) {
        if (iv.start > lastIdx) {
          html += escapeHtml(raw.slice(lastIdx, iv.start));
        }
        html += `<mark class="leaflet-highlight" style="background-color: ${iv.color}">${escapeHtml(
          raw.slice(iv.start, iv.end)
        )}</mark>`;
        lastIdx = iv.end;
      }
      if (lastIdx < raw.length) {
        html += escapeHtml(raw.slice(lastIdx));
      }
      span.innerHTML = html;
    }
  }, [annotations, currentPage, hasTextContent, textLayerReadyKey]);

  // Handle Text Selection in PDF Canvas
  const handleMouseUp = () => {
    const windowSel = window.getSelection();
    if (!windowSel || windowSel.isCollapsed || !windowSel.toString().trim()) {
      return;
    }

    const selectedText = windowSel.toString().trim();
    const range = windowSel.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    if (rect && containerRef.current) {
      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      setSelection({
        text: selectedText,
        x: rect.left - containerRect.left + container.scrollLeft + rect.width / 2,
        y: rect.top - containerRect.top + container.scrollTop - 10,
        pageNumber: currentPage,
      });
      setShowNoteField(false);
      setNoteInput('');
    }
  };

  // Create Highlight or Sticky Note
  const handleSaveHighlight = async (color: string) => {
    if (!selection) return;

    try {
      const res = await fetch('/api/annotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId: book.id,
          pageNumber: selection.pageNumber,
          selectedText: selection.text,
          color,
          note: noteInput.trim() || undefined,
          type: noteInput.trim() ? 'note' : 'highlight',
        }),
      });

      if (res.ok) {
        fetchReaderData();
        setSelection(null);
        setNoteInput('');
        setShowNoteField(false);
        window.getSelection()?.removeAllRanges();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Create Direct Note on Current Page
  const handleAddPageNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pageNoteText.trim()) return;

    try {
      const res = await fetch('/api/annotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId: book.id,
          pageNumber: currentPage,
          selectedText: `Note on Page ${currentPage}`,
          color: pageNoteColor,
          note: pageNoteText.trim(),
          type: 'note',
        }),
      });

      if (res.ok) {
        setPageNoteText('');
        setShowAddPageNote(false);
        fetchReaderData();
      }
    } catch (err) {
      console.error('Failed to add page note:', err);
    }
  };

  // Drag & Move Sticker on PDF Canvas
  const handleStickerPointerDown = (e: React.PointerEvent<HTMLDivElement>, st: StickerItem) => {
    e.stopPropagation();
    e.preventDefault();

    const container = pageContainerRef.current;
    if (!container) return;

    let isMoved = false;
    const initialRect = container.getBoundingClientRect();
    let currentX = st.xPercent;
    let currentY = st.yPercent;

    const onPointerMove = (moveEvent: PointerEvent) => {
      isMoved = true;
      const rect = pageContainerRef.current ? pageContainerRef.current.getBoundingClientRect() : initialRect;
      const xPercent = Math.max(2, Math.min(94, ((moveEvent.clientX - rect.left) / rect.width) * 100));
      const yPercent = Math.max(2, Math.min(94, ((moveEvent.clientY - rect.top) / rect.height) * 100));
      currentX = xPercent;
      currentY = yPercent;

      setStickers((prev) =>
        prev.map((item) => (item.id === st.id ? { ...item, xPercent, yPercent } : item))
      );
    };

    const onPointerUp = async () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);

      if (isMoved) {
        try {
          await fetch('/api/stickers', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: st.id,
              xPercent: Math.round(currentX * 10) / 10,
              yPercent: Math.round(currentY * 10) / 10,
            }),
          });
        } catch (err) {
          console.error('Failed to update sticker position:', err);
        }
      }
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  // Toggle Page Bookmark
  const isPageBookmarked = bookmarks.some((b) => b.pageNumber === currentPage);

  const handleToggleBookmark = async () => {
    try {
      if (isPageBookmarked) {
        await fetch(`/api/bookmarks?bookId=${book.id}&pageNumber=${currentPage}`, {
          method: 'DELETE',
        });
      } else {
        await fetch('/api/bookmarks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookId: book.id,
            pageNumber: currentPage,
            title: `Bookmark Page ${currentPage}`,
          }),
        });
      }
      fetchReaderData();
    } catch (err) {
      console.error(err);
    }
  };

  // Add Sticker to Page
  const handleAddSticker = async (emoji: string) => {
    try {
      const res = await fetch('/api/stickers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId: book.id,
          pageNumber: currentPage,
          emoji,
          xPercent: 50,
          yPercent: 30,
        }),
      });

      if (res.ok) {
        fetchReaderData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSticker = async (id: string) => {
    try {
      await fetch(`/api/stickers?id=${id}`, { method: 'DELETE' });
      fetchReaderData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAnnotation = async (id: string) => {
    try {
      await fetch(`/api/annotations?id=${id}`, { method: 'DELETE' });
      fetchReaderData();
    } catch (err) {
      console.error(err);
    }
  };

  // Execute Text Search inside PDF
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !pdfDoc) return;

    setIsSearching(true);
    const results: SearchResult[] = [];

    for (let i = 1; i <= pdfDoc.numPages; i++) {
      const page = await pdfDoc.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');

      if (pageText.toLowerCase().includes(searchQuery.toLowerCase())) {
        const matchIndex = pageText.toLowerCase().indexOf(searchQuery.toLowerCase());
        const start = Math.max(0, matchIndex - 30);
        const end = Math.min(pageText.length, matchIndex + searchQuery.length + 30);
        const snippet = '...' + pageText.substring(start, end) + '...';

        results.push({ pageNumber: i, snippet });
      }
    }

    setSearchResults(results);
    setIsSearching(false);
  };

  // Toggle Fit Width vs Fit Page
  const toggleFitWidth = useCallback(async () => {
    if (!pdfDoc || !containerRef.current) return;
    try {
      const page = await pdfDoc.getPage(currentPage);
      const defaultViewport = page.getViewport({ scale: 1.0 });
      const availableWidth = containerRef.current.clientWidth - 48;

      if (fitMode === 'width') {
        setFitMode('page');
        const availableHeight = containerRef.current.clientHeight - 48;
        const pageScale = availableHeight / defaultViewport.height;
        setScale(Math.max(Math.min(pageScale, 1.5), 0.5));
      } else {
        setFitMode('width');
        const widthScale = availableWidth / defaultViewport.width;
        setScale(Math.max(Math.min(widthScale, 2.5), 0.8));
      }
    } catch (err) {
      console.warn('Toggle fit width error:', err);
    }
  }, [pdfDoc, currentPage, fitMode]);

  // Keyboard Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        setCurrentPage((prev) => Math.min(prev + 1, numPages));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentPage((prev) => Math.max(prev - 1, 1));
      } else if (e.key === 'b' || e.key === 'B') {
        handleToggleBookmark();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFitWidth();
      } else if (e.key === 's' || e.key === 'S') {
        setSidebarOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setSelection(null);
        setHelpOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [numPages, isPageBookmarked, toggleFitWidth]);

  const currentStickers = stickers.filter((s) => s.pageNumber === currentPage);
  const currentAnnotations = annotations.filter((a) => a.pageNumber === currentPage);

  return (
    <div className={`h-screen max-h-screen w-screen overflow-hidden flex flex-col font-sans theme-${readerTheme} transition-colors duration-200`}>
      {/* --- READER HEADER TOOLBAR --- */}
      <header className="h-14 shrink-0 border-b border-[var(--reader-border)] bg-[var(--reader-bg)] px-3 sm:px-4 flex items-center justify-between z-30 shadow-xs text-[var(--reader-text)] transition-colors">
        {/* Left: Back & Title */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link
            href="/dashboard"
            className="p-1.5 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 text-[var(--reader-text)] transition-colors"
            title="Back to Library"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-serif-editorial text-base sm:text-lg font-bold truncate max-w-[120px] sm:max-w-xs md:max-w-md text-[var(--reader-text)]">
            {book.title}
          </span>
        </div>

        {/* Center: Page Controls, Fit Width Toggle, Zoom */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Page Navigation Pill */}
          <div className="flex items-center bg-black/5 dark:bg-white/10 border border-[var(--reader-border)] rounded-xl px-1.5 py-1 text-xs font-bold text-[var(--reader-text)] shadow-xs">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage <= 1}
              className="p-1 text-[var(--reader-text)] disabled:opacity-30 hover:bg-black/10 dark:hover:bg-white/20 rounded-lg transition-colors"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1 px-1.5 font-mono font-bold text-[var(--reader-text)]">
              <input
                type="number"
                min={1}
                max={numPages}
                value={currentPage}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val >= 1 && val <= numPages) setCurrentPage(val);
                }}
                className="w-11 text-center bg-black/10 dark:bg-white/15 text-[var(--reader-text)] font-bold text-xs rounded border border-[var(--reader-border)] px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-[var(--accent-main)]"
              />
              <span className="text-[var(--reader-text)] opacity-90">/ {numPages}</span>
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, numPages))}
              disabled={currentPage >= numPages}
              className="p-1 text-[var(--reader-text)] disabled:opacity-30 hover:bg-black/10 dark:hover:bg-white/20 rounded-lg transition-colors"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Fit Width / Full Width Toggle Button (Matching attached reference icon) */}
          <button
            onClick={toggleFitWidth}
            className={`px-2.5 py-1 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
              fitMode === 'width'
                ? 'bg-[var(--accent-main)] text-white border-[var(--accent-main)] ring-1 ring-[var(--accent-main)]'
                : 'bg-black/5 dark:bg-white/10 text-[var(--reader-text)] border-[var(--reader-border)] hover:bg-black/10 dark:hover:bg-white/20'
            }`}
            title={fitMode === 'width' ? "Switch to Fit Page" : "Switch to Fit Width / Full Width"}
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="3" />
              <path d="m8 12-2-2 2-2" />
              <path d="m16 12 2-2-2-2" />
              <path d="M6 10h12" />
            </svg>
            <span className="hidden md:inline font-sans">{fitMode === 'width' ? 'Fit Page' : 'Fit Width'}</span>
          </button>

          {/* Zoom Controls */}
          <div className="hidden sm:flex items-center bg-black/5 dark:bg-white/10 border border-[var(--reader-border)] rounded-xl px-1.5 py-1 text-xs font-bold text-[var(--reader-text)] shadow-xs">
            <button
              onClick={() => setScale((s) => Math.max(s - 0.1, 0.5))}
              className="p-1 text-[var(--reader-text)] hover:bg-black/10 dark:hover:bg-white/20 rounded-lg transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="px-2 font-mono font-bold text-[var(--reader-text)]">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={() => setScale((s) => Math.min(s + 0.1, 2.5))}
              className="p-1 text-[var(--reader-text)] hover:bg-black/10 dark:hover:bg-white/20 rounded-lg transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: Theme Switcher, Bookmark, Sidebar Toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Theme Selector */}
          <div className="flex items-center bg-black/5 dark:bg-white/10 border border-[var(--reader-border)] rounded-xl p-1 text-xs shadow-xs">
            <button
              onClick={() => setReaderTheme('light')}
              className={`p-1.5 rounded-lg transition-all ${
                readerTheme === 'light'
                  ? 'bg-white text-stone-950 font-bold shadow-xs'
                  : 'text-[var(--reader-text)] opacity-70 hover:opacity-100'
              }`}
              title="Light Theme"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setReaderTheme('sepia')}
              className={`px-2 py-1 rounded-lg font-serif font-bold text-[11px] transition-all ${
                readerTheme === 'sepia'
                  ? 'bg-[#F4ECD8] text-[#3B3228] shadow-xs'
                  : 'text-[var(--reader-text)] opacity-70 hover:opacity-100'
              }`}
              title="Sepia Paper Theme"
            >
              Sepia
            </button>
            <button
              onClick={() => setReaderTheme('dark')}
              className={`p-1.5 rounded-lg transition-all ${
                readerTheme === 'dark'
                  ? 'bg-stone-900 text-stone-100 font-bold shadow-xs'
                  : 'text-[var(--reader-text)] opacity-70 hover:opacity-100'
              }`}
              title="Dark Theme"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Bookmark Button */}
          <button
            onClick={handleToggleBookmark}
            className={`p-2 rounded-xl border transition-colors shadow-xs ${
              isPageBookmarked
                ? 'bg-amber-500 text-white border-amber-500'
                : 'bg-black/5 dark:bg-white/10 text-[var(--reader-text)] border-[var(--reader-border)] hover:bg-black/10 dark:hover:bg-white/20'
            }`}
            title="Bookmark Page"
          >
            <Bookmark className={`w-4 h-4 ${isPageBookmarked ? 'fill-white' : ''}`} />
          </button>

          {/* Keyboard Shortcut Help */}
          <button
            onClick={() => setHelpOpen(true)}
            className="p-2 rounded-xl bg-black/5 dark:bg-white/10 text-[var(--reader-text)] border border-[var(--reader-border)] hover:bg-black/10 dark:hover:bg-white/20 transition-colors shadow-xs"
            title="Shortcuts Help"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Sidebar Toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-2 rounded-xl border transition-colors shadow-xs ${
              sidebarOpen
                ? 'bg-[var(--text-main)] text-[var(--bg-main)] border-[var(--text-main)]'
                : 'bg-black/5 dark:bg-white/10 text-[var(--reader-text)] border-[var(--reader-border)] hover:bg-black/10 dark:hover:bg-white/20'
            }`}
            title="Toggle Sidebar"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* --- READER BODY SPLIT --- */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {/* --- SIDEBAR --- */}
        {sidebarOpen && (
          <aside className="w-80 shrink-0 h-full border-r border-[var(--reader-border)] bg-[var(--reader-bg)] text-[var(--reader-text)] flex flex-col z-20 shadow-md min-h-0">
            {/* Sidebar Tabs */}
            <div className="shrink-0 flex border-b border-[var(--reader-border)] text-xs font-semibold">
              <button
                onClick={() => setActiveTab('toc')}
                className={`flex-1 py-3 border-b-2 text-center transition-colors ${
                  activeTab === 'toc'
                    ? 'border-[var(--accent-main)] text-[var(--accent-main)] font-bold'
                    : 'border-transparent text-[var(--reader-muted)] hover:text-[var(--reader-text)]'
                }`}
              >
                Outline
              </button>
              <button
                onClick={() => setActiveTab('annotations')}
                className={`flex-1 py-3 border-b-2 text-center transition-colors ${
                  activeTab === 'annotations'
                    ? 'border-[var(--accent-main)] text-[var(--accent-main)] font-bold'
                    : 'border-transparent text-[var(--reader-muted)] hover:text-[var(--reader-text)]'
                }`}
              >
                Notes ({annotations.length})
              </button>
              <button
                onClick={() => setActiveTab('stickers')}
                className={`flex-1 py-3 border-b-2 text-center transition-colors ${
                  activeTab === 'stickers'
                    ? 'border-[var(--accent-main)] text-[var(--accent-main)] font-bold'
                    : 'border-transparent text-[var(--reader-muted)] hover:text-[var(--reader-text)]'
                }`}
              >
                Stickers
              </button>
              <button
                onClick={() => setActiveTab('search')}
                className={`flex-1 py-3 border-b-2 text-center transition-colors ${
                  activeTab === 'search'
                    ? 'border-[var(--accent-main)] text-[var(--accent-main)] font-bold'
                    : 'border-transparent text-[var(--reader-muted)] hover:text-[var(--reader-text)]'
                }`}
              >
                Search
              </button>
            </div>

            {/* Sidebar Tab Content */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
              {/* TOC TAB */}
              {activeTab === 'toc' && (
                <div className="space-y-2">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--reader-muted)]">Table of Contents</h3>
                  {toc.length === 0 ? (
                    <p className="text-xs text-[var(--reader-muted)] italic">No document outline available.</p>
                  ) : (
                    <div className="space-y-1">
                      {toc.map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentPage(item.pageNumber)}
                          className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors border ${
                            currentPage === item.pageNumber
                              ? 'bg-[var(--accent-light)] text-[var(--accent-main)] font-bold border-[var(--accent-main)]/30'
                              : 'text-[var(--reader-text)] border-transparent hover:bg-black/5 dark:hover:bg-white/10'
                          }`}
                        >
                          <span className="truncate font-semibold text-[var(--reader-text)]">{item.title}</span>
                          <span className="text-[11px] font-mono font-bold text-[var(--reader-muted)] shrink-0 ml-2">p.{item.pageNumber}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ANNOTATIONS TAB */}
              {activeTab === 'annotations' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--reader-muted)]">Highlights & Notes</h3>
                    <button
                      onClick={() => setShowAddPageNote(!showAddPageNote)}
                      className="px-2.5 py-1 rounded-lg bg-[var(--accent-main)] text-[var(--bg-main)] text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1 shadow-xs"
                      title="Add note to current page"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Note</span>
                    </button>
                  </div>

                  {/* Inline Add Page Note Form */}
                  {showAddPageNote && (
                    <form onSubmit={handleAddPageNote} className="p-3 rounded-xl border border-[var(--accent-main)]/40 bg-[var(--reader-surface)] space-y-2.5 animate-fadeIn shadow-xs">
                      <div className="flex items-center justify-between text-xs font-bold text-[var(--reader-muted)]">
                        <span>Note on Page {currentPage}</span>
                        <div className="flex items-center gap-1">
                          {HIGHLIGHT_COLORS.map((c) => (
                            <button
                              key={c.name}
                              type="button"
                              onClick={() => setPageNoteColor(c.value)}
                              className={`w-3.5 h-3.5 rounded-full ${c.class} ${pageNoteColor === c.value ? 'ring-2 ring-offset-1 ring-[var(--accent-main)]' : ''}`}
                            />
                          ))}
                        </div>
                      </div>
                      <textarea
                        rows={3}
                        value={pageNoteText}
                        onChange={(e) => setPageNoteText(e.target.value)}
                        placeholder={`Write your thoughts for page ${currentPage}...`}
                        className="w-full p-2 rounded-lg bg-black/5 dark:bg-white/10 text-xs text-[var(--reader-text)] border border-[var(--reader-border)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-main)] resize-none"
                        autoFocus
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowAddPageNote(false)}
                          className="px-2 py-1 text-xs text-[var(--reader-muted)] hover:text-[var(--reader-text)]"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={!pageNoteText.trim()}
                          className="px-3 py-1 rounded-lg bg-[var(--accent-main)] text-[var(--bg-main)] text-xs font-bold disabled:opacity-50"
                        >
                          Save Note
                        </button>
                      </div>
                    </form>
                  )}

                  {annotations.length === 0 ? (
                    <p className="text-xs text-[var(--reader-muted)] italic">Click "+ Note" above or select any text on a page to create your first note.</p>
                  ) : (
                    annotations.map((ann) => (
                      <div
                        key={ann.id}
                        className="p-3 rounded-xl border border-[var(--reader-border)] bg-[var(--reader-surface)] space-y-2 text-xs shadow-xs hover:border-[var(--accent-main)] transition-colors group cursor-pointer text-[var(--reader-text)]"
                        onClick={() => setCurrentPage(ann.pageNumber)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[11px] font-bold text-[var(--accent-main)] bg-[var(--accent-light)] px-2 py-0.5 rounded-md">
                            Page {ann.pageNumber}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAnnotation(ann.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 text-[var(--reader-muted)] hover:text-red-500 transition-opacity"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <p
                          className="italic font-serif-editorial text-[var(--reader-text)] p-2 rounded-lg border-l-2"
                          style={{
                            backgroundColor: `${ann.color || '#fef08a'}25`,
                            borderLeftColor: ann.color || '#fef08a',
                          }}
                        >
                          "{ann.selectedText}"
                        </p>

                        {ann.note && (
                          <p className="text-[var(--reader-text)] opacity-90 font-sans border-l-2 border-[var(--accent-main)] pl-2">
                            {ann.note}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* STICKERS TAB */}
              {activeTab === 'stickers' && (
                <div className="space-y-4 text-[var(--reader-text)]">
                  <div>
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--reader-muted)] mb-2">Place Sticker on Page {currentPage}</h3>
                    <div className="grid grid-cols-4 gap-2">
                      {EMOJI_STICKERS.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => handleAddSticker(emoji)}
                          className="h-11 text-2xl bg-black/5 dark:bg-white/10 hover:bg-[var(--accent-light)] border border-[var(--reader-border)] rounded-xl flex items-center justify-center transition-all hover:scale-110 shadow-xs"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 space-y-2">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-[var(--reader-muted)]">Page Stickers ({currentStickers.length})</h4>
                    {currentStickers.map((st) => (
                      <div key={st.id} className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--reader-surface)] border border-[var(--reader-border)] text-xs font-semibold">
                        <span className="text-xl">{st.emoji} Sticker</span>
                        <button onClick={() => handleDeleteSticker(st.id)} className="text-[var(--reader-muted)] hover:text-red-500">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SEARCH TAB */}
              {activeTab === 'search' && (
                <div className="space-y-4 text-[var(--reader-text)]">
                  <form onSubmit={handleSearch} className="space-y-2">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search inside PDF..."
                      className="w-full px-3 py-2.5 rounded-xl border border-[var(--reader-border)] bg-black/5 dark:bg-white/10 text-[var(--reader-text)] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--accent-main)] placeholder:text-[var(--reader-muted)]"
                    />
                    <button
                      type="submit"
                      disabled={isSearching}
                      className="w-full py-2.5 rounded-xl bg-[var(--text-main)] text-[var(--bg-main)] text-xs font-bold hover:bg-[var(--accent-main)] transition-colors shadow-xs"
                    >
                      {isSearching ? 'Searching PDF...' : 'Search'}
                    </button>
                  </form>

                  <div className="space-y-2">
                    {searchResults.map((res, idx) => (
                      <div
                        key={idx}
                        onClick={() => setCurrentPage(res.pageNumber)}
                        className="p-3 rounded-xl border border-[var(--reader-border)] bg-[var(--reader-surface)] hover:border-[var(--accent-main)] cursor-pointer text-xs space-y-1 text-[var(--reader-text)]"
                      >
                        <span className="font-bold font-mono text-[11px] text-[var(--accent-main)]">Page {res.pageNumber}</span>
                        <p className="text-[var(--reader-text)] opacity-90 line-clamp-2">{res.snippet}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}

        {/* --- MAIN CANVAS PDF VIEWPORT --- */}
        <main
          ref={containerRef}
          onMouseUp={handleMouseUp}
          className="flex-1 h-full min-h-0 overflow-auto p-4 sm:p-8 flex justify-center items-start bg-[var(--bg-main)] relative"
        >
          {/* PDF Page Container */}
          <div
            ref={pageContainerRef}
            className="pdf-page-container relative bg-white dark:bg-stone-900 border border-[var(--reader-border)] rounded-sm shadow-2xl overflow-hidden"
          >
            {/* Canvas */}
            <canvas ref={canvasRef} className="block" />

            {/* Text Selection Layer */}
            <div ref={textLayerRef} className="textLayer absolute inset-0 pointer-events-auto" />

            {/* Interactive PDF Link Layer */}
            <div ref={annotationLayerRef} className="annotationLayer absolute inset-0 pointer-events-none" />

            {/* Sticker Overlay Icons */}
            {currentStickers.map((st) => (
              <div
                key={st.id}
                onPointerDown={(e) => handleStickerPointerDown(e, st)}
                style={{
                  position: 'absolute',
                  left: `${st.xPercent}%`,
                  top: `${st.yPercent}%`,
                  transform: `translate(-50%, -50%) scale(${st.scale}) rotate(${st.rotation}deg)`,
                  touchAction: 'none',
                }}
                className="text-3xl cursor-grab active:cursor-grabbing hover:scale-125 transition-transform z-20 filter drop-shadow-md select-none group"
                title="Drag to reposition sticker"
              >
                <span>{st.emoji}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteSticker(st.id);
                  }}
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] hidden group-hover:flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
                  title="Remove sticker"
                >
                  ✕
                </button>
              </div>
            ))}

            {/* Bookmark Badge */}
            {isPageBookmarked && (
              <div className="absolute top-0 right-6 w-8 h-10 bg-amber-500 text-white flex items-center justify-center rounded-b-md shadow-md z-20">
                <Bookmark className="w-5 h-5 fill-white" />
              </div>
            )}
          </div>

          {/* Cover / Scanned Image Page Notice */}
          {!hasTextContent && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-stone-900/90 text-white text-xs px-4 py-2 rounded-full shadow-2xl border border-stone-700 flex items-center gap-2 z-30 animate-fadeIn pointer-events-none">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
              <span className="font-medium">Cover / image page (no selectable text) — press Next (→) to start reading and highlighting</span>
            </div>
          )}

          {/* Contextual Text Highlight Popover */}
          {selection && (
            <div
              style={{ left: `${selection.x}px`, top: `${selection.y}px` }}
              onMouseDown={(e) => e.stopPropagation()}
              onMouseUp={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              className="absolute -translate-x-1/2 -translate-y-full mb-2 bg-stone-900 text-white rounded-xl shadow-2xl p-2 z-40 space-y-2 animate-fadeIn border border-stone-700"
            >
              <div className="flex items-center gap-1.5">
                {HIGHLIGHT_COLORS.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => handleSaveHighlight(c.value)}
                    className={`w-6 h-6 rounded-full ${c.class} hover:scale-110 transition-transform shadow-xs`}
                    title={`Highlight ${c.name}`}
                  />
                ))}

                <span className="w-px h-4 bg-stone-700 mx-1" />

                <button
                  onClick={() => setShowNoteField(!showNoteField)}
                  className="px-2.5 py-1 text-xs font-semibold bg-stone-800 hover:bg-stone-700 rounded-lg text-amber-300"
                >
                  Note
                </button>

                <button onClick={() => setSelection(null)} className="p-1 text-stone-400 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {showNoteField && (
                <div className="pt-2 border-t border-stone-800 space-y-2">
                  <textarea
                    rows={2}
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    placeholder="Attach your note..."
                    className="w-full p-2 rounded-lg bg-stone-800 text-white text-xs border border-stone-700 focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={() => handleSaveHighlight('#fef08a')}
                    className="w-full py-1 rounded-lg bg-amber-500 text-stone-950 font-bold text-xs"
                  >
                    Save Highlight & Note
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Keyboard Shortcuts Modal */}
      {helpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-[var(--bg-surface)] p-6 rounded-2xl border border-[var(--border-main)] max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--border-main)] pb-3">
              <h3 className="font-serif-editorial text-xl font-bold">Keyboard Shortcuts</h3>
              <button onClick={() => setHelpOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-main)]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-stone-100 dark:border-stone-800">
                <span className="font-semibold">Next Page</span>
                <kbd className="px-2 py-0.5 rounded bg-stone-200 dark:bg-stone-800 font-mono">→</kbd> or <kbd className="px-2 py-0.5 rounded bg-stone-200 dark:bg-stone-800 font-mono">Space</kbd>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100 dark:border-stone-800">
                <span className="font-semibold">Previous Page</span>
                <kbd className="px-2 py-0.5 rounded bg-stone-200 dark:bg-stone-800 font-mono">←</kbd>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100 dark:border-stone-800">
                <span className="font-semibold">Bookmark Page</span>
                <kbd className="px-2 py-0.5 rounded bg-stone-200 dark:bg-stone-800 font-mono">B</kbd>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100 dark:border-stone-800">
                <span className="font-semibold">Toggle Sidebar</span>
                <kbd className="px-2 py-0.5 rounded bg-stone-200 dark:bg-stone-800 font-mono">S</kbd>
              </div>
              <div className="flex justify-between py-1">
                <span className="font-semibold">Close Overlay / Popover</span>
                <kbd className="px-2 py-0.5 rounded bg-stone-200 dark:bg-stone-800 font-mono">Esc</kbd>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
