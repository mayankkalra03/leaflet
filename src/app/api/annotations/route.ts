import { NextResponse } from 'next/server';
import { getEffectiveUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { annotationSchema } from '@/lib/validation';

export async function GET(req: Request) {
  try {
    const user = await getEffectiveUser();
    if (!user) {
      return NextResponse.json({ annotations: [] });
    }

    const { searchParams } = new URL(req.url);
    const bookId = searchParams.get('bookId');

    const where: any = { userId: user.userId };
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
    const user = await getEffectiveUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validated = annotationSchema.parse(body);

    const book = await db.book.findFirst({
      where: { id: validated.bookId },
    });

    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    const annotation = await db.annotation.create({
      data: {
        userId: user.userId,
        bookId: validated.bookId,
        pageNumber: validated.pageNumber,
        selectedText: validated.selectedText || 'Page Note',
        textPrefix: validated.textPrefix || null,
        textSuffix: validated.textSuffix || null,
        startOffset: validated.startOffset || null,
        endOffset: validated.endOffset || null,
        color: validated.color || '#fef08a',
        note: validated.note || null,
        type: validated.type || 'highlight',
      },
    });

    return NextResponse.json({ annotation });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors[0]?.message || 'Invalid input' }, { status: 400 });
    }
    console.error('Create annotation error:', error);
    return NextResponse.json({ error: 'Failed to create annotation' }, { status: 500 });
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

    if (!id) {
      return NextResponse.json({ error: 'Annotation ID required' }, { status: 400 });
    }

    const annotation = await db.annotation.findFirst({
      where: { id },
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
