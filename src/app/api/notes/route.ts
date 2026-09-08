import { NextResponse } from 'next/server';
import { getEffectiveUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const user = await getEffectiveUser();
    if (!user) {
      return NextResponse.json({ notes: [] });
    }

    const { searchParams } = new URL(req.url);
    const bookId = searchParams.get('bookId');
    const search = searchParams.get('search') || '';

    const where: any = { userId: user.userId };
    if (bookId) where.bookId = bookId;

    if (search) {
      where.OR = [
        { selectedText: { contains: search } },
        { note: { contains: search } },
      ];
    }

    const annotations = await db.annotation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            coverUrl: true,
          },
        },
      },
    });

    return NextResponse.json({ notes: annotations });
  } catch (error) {
    console.error('Fetch notes error:', error);
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
  }
}
