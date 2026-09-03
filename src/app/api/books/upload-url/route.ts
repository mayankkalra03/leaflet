import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { createSignedUploadUrl } from '@/lib/storage';

export async function POST(req: Request) {
  try {
    const session = await getAuthUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const filename = body.filename || 'book.pdf';

    if (!filename.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json({ error: 'Only PDF files are supported' }, { status: 400 });
    }

    const uploadInfo = await createSignedUploadUrl(filename);
    return NextResponse.json(uploadInfo);
  } catch (error: any) {
    console.error('Create upload URL error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
}
