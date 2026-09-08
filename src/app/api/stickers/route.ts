import { NextResponse } from 'next/server';
import { getEffectiveUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { stickerSchema } from '@/lib/validation';
import crypto from 'crypto';

export async function GET(req: Request) {
  try {
    const user = await getEffectiveUser();
    if (!user) {
      return NextResponse.json({ stickers: [] });
    }

    const { searchParams } = new URL(req.url);
    const bookId = searchParams.get('bookId');

    let stickers: any[];
    if (bookId) {
      stickers = await db.$queryRawUnsafe<any[]>(
        `SELECT id, "userId", "bookId", "pageNumber", emoji, note, "xPercent", "yPercent", scale, rotation, "createdAt"
         FROM "Sticker"
         WHERE "userId" = $1 AND "bookId" = $2
         ORDER BY "pageNumber" ASC`,
        user.userId,
        bookId
      );
    } else {
      stickers = await db.$queryRawUnsafe<any[]>(
        `SELECT id, "userId", "bookId", "pageNumber", emoji, note, "xPercent", "yPercent", scale, rotation, "createdAt"
         FROM "Sticker"
         WHERE "userId" = $1
         ORDER BY "pageNumber" ASC`,
        user.userId
      );
    }

    return NextResponse.json({ stickers });
  } catch (error) {
    console.error('Fetch stickers error:', error);
    return NextResponse.json({ error: 'Failed to fetch stickers' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getEffectiveUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validated = stickerSchema.parse(body);
    const stickerId = crypto.randomUUID();

    const rows = await db.$queryRawUnsafe<any[]>(
      `INSERT INTO "Sticker" (id, "userId", "bookId", "pageNumber", emoji, note, "xPercent", "yPercent", scale, rotation, "createdAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
       RETURNING id, "userId", "bookId", "pageNumber", emoji, note, "xPercent", "yPercent", scale, rotation, "createdAt"`,
      stickerId,
      user.userId,
      validated.bookId,
      validated.pageNumber,
      validated.emoji,
      validated.note || null,
      validated.xPercent,
      validated.yPercent,
      validated.scale ?? 1.0,
      validated.rotation ?? 0.0
    );

    return NextResponse.json({ sticker: rows[0] });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors[0]?.message || 'Invalid input' }, { status: 400 });
    }
    console.error('Create sticker error:', error);
    return NextResponse.json({ error: 'Failed to create sticker' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getEffectiveUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, xPercent, yPercent, scale, rotation, note } = body;

    if (!id) {
      return NextResponse.json({ error: 'Sticker ID required' }, { status: 400 });
    }

    // Update with parameterized raw SQL to bypass any in-memory Prisma client engine lock
    const rows = await db.$queryRawUnsafe<any[]>(
      `UPDATE "Sticker"
       SET "xPercent" = COALESCE($1, "xPercent"),
           "yPercent" = COALESCE($2, "yPercent"),
           scale = COALESCE($3, scale),
           rotation = COALESCE($4, rotation),
           note = CASE WHEN $5::boolean THEN $6 ELSE note END
       WHERE id = $7
       RETURNING id, "userId", "bookId", "pageNumber", emoji, note, "xPercent", "yPercent", scale, rotation, "createdAt"`,
      xPercent ?? null,
      yPercent ?? null,
      scale ?? null,
      rotation ?? null,
      note !== undefined,
      note || null,
      id
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'Sticker not found' }, { status: 404 });
    }

    return NextResponse.json({ sticker: rows[0] });
  } catch (error) {
    console.error('Update sticker error:', error);
    return NextResponse.json({ error: 'Failed to update sticker' }, { status: 500 });
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
      return NextResponse.json({ error: 'Sticker ID required' }, { status: 400 });
    }

    await db.$executeRawUnsafe(
      `DELETE FROM "Sticker" WHERE id = $1`,
      id
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete sticker error:', error);
    return NextResponse.json({ error: 'Failed to delete sticker' }, { status: 500 });
  }
}
