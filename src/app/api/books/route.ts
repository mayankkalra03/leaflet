import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { saveFile } from '@/lib/storage';
import { PDFDocument } from 'pdf-lib';

export async function GET(req: Request) {
  try {
    const session = await getAuthUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const favorite = searchParams.get('favorite');
    const sort = searchParams.get('sort') || 'recent';

    const where: any = {
      userId: session.userId,
    };

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { author: { contains: search } },
      ];
    }

    if (favorite === 'true') {
      where.isFavorite = true;
    }

    let orderBy: any = { updatedAt: 'desc' };
    if (sort === 'title') {
      orderBy = { title: 'asc' };
    } else if (sort === 'author') {
      orderBy = { author: 'asc' };
    }

    const books = await db.book.findMany({
      where,
      orderBy,
      include: {
        progress: {
          where: { userId: session.userId },
        },
        _count: {
          select: {
            annotations: true,
            bookmarks: true,
            stickers: true,
          },
        },
      },
    });

    const formattedBooks = books.map((book) => ({
      ...book,
      progress: book.progress[0] || null,
    }));

    return NextResponse.json({ books: formattedBooks });
  } catch (error) {
    console.error('Fetch books error:', error);
    return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAuthUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const customTitle = formData.get('title') as string | null;
    const customAuthor = formData.get('author') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are supported' }, { status: 400 });
    }

    // 50MB File size limit
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds maximum limit of 50MB' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let totalPages = 1;
    let extractedTitle = customTitle || file.name.replace(/\.pdf$/i, '');
    let extractedAuthor = customAuthor || 'Unknown Author';

    try {
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      totalPages = pdfDoc.getPageCount();
      if (!customTitle && pdfDoc.getTitle()) {
        extractedTitle = pdfDoc.getTitle()!;
      }
      if (!customAuthor && pdfDoc.getAuthor()) {
        extractedAuthor = pdfDoc.getAuthor()!;
      }
    } catch (pdfErr) {
      console.warn('PDF metadata extraction warning:', pdfErr);
    }

    const fileUrl = await saveFile(buffer, file.name, file.type);

    const book = await db.book.create({
      data: {
        userId: session.userId,
        title: extractedTitle.trim() || 'Untitled Book',
        author: extractedAuthor.trim() || 'Unknown Author',
        fileUrl,
        fileSize: file.size,
        totalPages,
      },
    });

    // Create initial reading progress record
    await db.readingProgress.create({
      data: {
        userId: session.userId,
        bookId: book.id,
        currentPage: 1,
        progressPercent: 0,
      },
    });

    return NextResponse.json({ book });
  } catch (error) {
    console.error('Upload book error:', error);
    return NextResponse.json({ error: 'Failed to upload book' }, { status: 500 });
  }
}
