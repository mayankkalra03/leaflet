import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { annotationSchema } from '@/lib/validation';

export async function GET(req: Request) {
  try {
    const session = await getAuthUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const bookId = searchParams.get('bookId');

    const where: any = { userId: session.userId };
    if (bookId) where.bookId = bookId;

    const annotations = await db.annotation.findMany({
      where,
      orderBy: [{ pageNumber: 'asc' }, { createdAt: 'desc' }],
      include: {
        book: {
          select: { title: true, author: true },
        },
      },
    });

    return NextResponse.json({ annotations });
  } catch (error) {
    console.error('Fetch annotations error:', error);
    return NextResponse.json({ error: 'Failed to fetch annotations' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAuthUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validated = annotationSchema.parse(body);

    const book = await db.book.findFirst({
      where: { id: validated.bookId, userId: session.userId },
    });

    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    const annotation = await db.annotation.create({
      data: {
        userId: session.userId,
        bookId: validated.bookId,
        pageNumber: validated.pageNumber,
        selectedText: validated.selectedText,
        textPrefix: validated.textPrefix,
        textSuffix: validated.textSuffix,
        startOffset: validated.startOffset,
        endOffset: validated.endOffset,
        color: validated.color,
        note: validated.note,
        type: validated.type,
      },
    });

    return NextResponse.json({ annotation });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error('Create annotation error:', error);
    return NextResponse.json({ error: 'Failed to create annotation' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getAuthUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Annotation ID required' }, { status: 400 });
    }

    const annotation = await db.annotation.findFirst({
      where: { id, userId: session.userId },
    });

    if (!annotation) {
      return NextResponse.json({ error: 'Annotation not found' }, { status: 404 });
    }

    await db.annotation.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete annotation error:', error);
    return NextResponse.json({ error: 'Failed to delete annotation' }, { status: 500 });
  }
}
