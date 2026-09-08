import { NextResponse } from 'next/server';
import { getEffectiveUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { progressSchema } from '@/lib/validation';

export async function POST(req: Request) {
  try {
    const user = await getEffectiveUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validated = progressSchema.parse(body);

    const book = await db.book.findFirst({
      where: { id: validated.bookId },
    });

    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    const updatedProgress = await db.readingProgress.upsert({
      where: {
        userId_bookId: {
          userId: user.userId,
          bookId: validated.bookId,
        },
      },
      update: {
        currentPage: validated.currentPage,
        progressPercent: validated.progressPercent,
        lastReadAt: new Date(),
      },
      create: {
        userId: user.userId,
        bookId: validated.bookId,
        currentPage: validated.currentPage,
        progressPercent: validated.progressPercent,
        lastReadAt: new Date(),
      },
    });

    // Track session entry for today
    const today = new Date().toISOString().split('T')[0];
    const existingSession = await db.readingSession.findFirst({
      where: {
        userId: user.userId,
        bookId: validated.bookId,
        sessionDate: today,
      },
    });

    if (existingSession) {
      await db.readingSession.update({
        where: { id: existingSession.id },
        data: {
          pagesRead: Math.max(existingSession.pagesRead, validated.currentPage),
          durationSeconds: { increment: 30 },
        },
      });
    } else {
      await db.readingSession.create({
        data: {
          userId: user.userId,
          bookId: validated.bookId,
          sessionDate: today,
          pagesRead: validated.currentPage,
          durationSeconds: 60,
        },
      });
    }

    return NextResponse.json({ progress: updatedProgress });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors[0]?.message || 'Invalid input' }, { status: 400 });
    }
    console.error('Update progress error:', error);
    return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 });
  }
}
