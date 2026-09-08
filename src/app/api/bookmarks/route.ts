import { NextResponse } from 'next/server';
import { getEffectiveUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { bookmarkSchema } from '@/lib/validation';

export async function GET(req: Request) {
  try {
    const user = await getEffectiveUser();
    if (!user) {
      return NextResponse.json({ bookmarks: [] });
    }

    const { searchParams } = new URL(req.url);
    const bookId = searchParams.get('bookId');

    const where: any = { userId: user.userId };
    if (bookId) where.bookId = bookId;

    const bookmarks = await db.bookmark.findMany({
      where,
      orderBy: { pageNumber: 'asc' },
    });

    return NextResponse.json({ bookmarks });
  } catch (error) {
    console.error('Fetch bookmarks error:', error);
    return NextResponse.json({ error: 'Failed to fetch bookmarks' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getEffectiveUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validated = bookmarkSchema.parse(body);

    const bookmark = await db.bookmark.upsert({
      where: {
        userId_bookId_pageNumber: {
          userId: user.userId,
          bookId: validated.bookId,
          pageNumber: validated.pageNumber,
        },
      },
      update: {
        title: validated.title,
        note: validated.note,
      },
      create: {
        userId: user.userId,
        bookId: validated.bookId,
        pageNumber: validated.pageNumber,
        title: validated.title,
        note: validated.note,
      },
    });

    return NextResponse.json({ bookmark });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors[0]?.message || 'Invalid input' }, { status: 400 });
    }
    console.error('Create bookmark error:', error);
    return NextResponse.json({ error: 'Failed to create bookmark' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getEffectiveUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const bookId = searchParams.get('bookId');
    const pageNumber = searchParams.get('pageNumber');

    if (id) {
      await db.bookmark.deleteMany({
        where: { id },
      });
    } else if (bookId && pageNumber) {
      await db.bookmark.deleteMany({
        where: {
          userId: user.userId,
          bookId,
          pageNumber: parseInt(pageNumber, 10),
        },
      });
    } else {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete bookmark error:', error);
    return NextResponse.json({ error: 'Failed to delete bookmark' }, { status: 500 });
  }
}
