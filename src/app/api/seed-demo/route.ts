import { NextResponse } from 'next/server';
import { getAuthUser, signToken, setAuthCookie, hashPassword } from '@/lib/auth';
import { db } from '@/lib/db';
import { getOrCreateDemoBook } from '@/lib/demo-book';

export async function GET() {
  try {
    let session = await getAuthUser();
    let userId: string;

    if (!session) {
      // Create guest demo user automatically
      const demoEmail = `guest_${Date.now()}@leaflet.read`;
      const passwordHash = await hashPassword('guestpass123');

      const guestUser = await db.user.create({
        data: {
          name: 'Demo Reader',
          email: demoEmail,
          passwordHash,
        },
      });

      userId = guestUser.id;
      const token = signToken({
        userId: guestUser.id,
        email: guestUser.email,
        name: guestUser.name,
      });

      await setAuthCookie(token);
    } else {
      userId = session.userId;
    }

    const demoBook = await getOrCreateDemoBook(userId);

    return NextResponse.json({
      bookId: demoBook.id,
      url: `/read/${demoBook.id}`,
    });
  } catch (error) {
    console.error('Seed demo error:', error);
    return NextResponse.json({ error: 'Failed to launch demo reader' }, { status: 500 });
  }
}
