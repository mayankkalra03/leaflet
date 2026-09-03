import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const updateBookSchema = z.object({
  title: z.string().min(1).optional(),
  author: z.string().optional(),
  isFavorite: z.boolean().optional(),
});

export const progressSchema = z.object({
  bookId: z.string().uuid(),
  currentPage: z.number().int().min(1),
  progressPercent: z.number().min(0).max(100),
});

export const annotationSchema = z.object({
  bookId: z.string().uuid(),
  pageNumber: z.number().int().min(1),
  selectedText: z.string().optional().default('Page Note'),
  textPrefix: z.string().optional().nullable(),
  textSuffix: z.string().optional().nullable(),
  startOffset: z.number().int().optional().nullable(),
  endOffset: z.number().int().optional().nullable(),
  color: z.string().default('#fef08a'),
  note: z.string().optional().nullable(),
  type: z.enum(['highlight', 'note']).default('highlight'),
});

export const bookmarkSchema = z.object({
  bookId: z.string().uuid(),
  pageNumber: z.number().int().min(1),
  title: z.string().optional(),
  note: z.string().optional(),
});

export const stickerSchema = z.object({
  bookId: z.string().uuid(),
  pageNumber: z.number().int().min(1),
  emoji: z.string().min(1),
  xPercent: z.number().min(0).max(100),
  yPercent: z.number().min(0).max(100),
  scale: z.number().default(1.0),
  rotation: z.number().default(0.0),
});
