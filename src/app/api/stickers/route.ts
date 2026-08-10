import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { stickerSchema } from '@/lib/validation';

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

    const stickers = await db.sticker.findMany({
      where,
      orderBy: { pageNumber: 'asc' },
    });

    return NextResponse.json({ stickers });
  } catch (error) {
    console.error('Fetch stickers error:', error);
    return NextResponse.json({ error: 'Failed to fetch stickers' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAuthUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validated = stickerSchema.parse(body);

    const sticker = await db.sticker.create({
      data: {
        userId: session.userId,
        bookId: validated.bookId,
        pageNumber: validated.pageNumber,
        emoji: validated.emoji,
        xPercent: validated.xPercent,
        yPercent: validated.yPercent,
        scale: validated.scale,
        rotation: validated.rotation,
      },
    });

    return NextResponse.json({ sticker });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error('Create sticker error:', error);
    return NextResponse.json({ error: 'Failed to create sticker' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getAuthUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, xPercent, yPercent, scale, rotation } = body;

    if (!id) {
      return NextResponse.json({ error: 'Sticker ID required' }, { status: 400 });
    }

    const sticker = await db.sticker.findFirst({
      where: { id, userId: session.userId },
    });

    if (!sticker) {
      return NextResponse.json({ error: 'Sticker not found' }, { status: 404 });
    }

    const updated = await db.sticker.update({
      where: { id },
      data: {
        xPercent: xPercent ?? sticker.xPercent,
        yPercent: yPercent ?? sticker.yPercent,
        scale: scale ?? sticker.scale,
        rotation: rotation ?? sticker.rotation,
      },
    });

    return NextResponse.json({ sticker: updated });
  } catch (error) {
    console.error('Update sticker error:', error);
    return NextResponse.json({ error: 'Failed to update sticker' }, { status: 500 });
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
      return NextResponse.json({ error: 'Sticker ID required' }, { status: 400 });
    }

    await db.sticker.deleteMany({
      where: { id, userId: session.userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete sticker error:', error);
    return NextResponse.json({ error: 'Failed to delete sticker' }, { status: 500 });
  }
}
