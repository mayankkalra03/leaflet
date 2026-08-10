import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { deleteFile } from '@/lib/storage';
import { updateBookSchema } from '@/lib/validation';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const book = await db.book.findFirst({
      where: {
        id,
        userId: session.userId,
      },
      include: {
        progress: {
          where: { userId: session.userId },
        },
        annotations: {
          where: { userId: session.userId },
          orderBy: { pageNumber: 'asc' },
        },
        bookmarks: {
          where: { userId: session.userId },
          orderBy: { pageNumber: 'asc' },
        },
        stickers: {
          where: { userId: session.userId },
          orderBy: { pageNumber: 'asc' },
        },
      },
    });

    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    return NextResponse.json({
      book: {
        ...book,
        progress: book.progress[0] || null,
      },
    });
  } catch (error) {
    console.error('Get book error:', error);
    return NextResponse.json({ error: 'Failed to fetch book' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const validated = updateBookSchema.parse(body);

    const book = await db.book.findFirst({
      where: { id, userId: session.userId },
    });

    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    const updated = await db.book.update({
      where: { id },
      data: validated,
    });

    return NextResponse.json({ book: updated });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error('Update book error:', error);
    return NextResponse.json({ error: 'Failed to update book' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const book = await db.book.findFirst({
      where: { id, userId: session.userId },
    });

    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    if (book.fileUrl) {
      await deleteFile(book.fileUrl);
    }

    await db.book.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete book error:', error);
    return NextResponse.json({ error: 'Failed to delete book' }, { status: 500 });
  }
}
