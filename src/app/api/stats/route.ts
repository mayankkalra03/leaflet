import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await getAuthUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.userId;

    const totalBooks = await db.book.count({ where: { userId } });
    const totalAnnotations = await db.annotation.count({ where: { userId } });
    const totalBookmarks = await db.bookmark.count({ where: { userId } });
    const totalStickers = await db.sticker.count({ where: { userId } });

    const progressRecords = await db.readingProgress.findMany({
      where: { userId },
      include: { book: { select: { totalPages: true, title: true } } },
    });

    let completedBooks = 0;
    let totalPagesRead = 0;

    progressRecords.forEach((record) => {
      totalPagesRead += record.currentPage;
      if (record.progressPercent >= 99 || record.currentPage >= record.book.totalPages) {
        completedBooks += 1;
      }
    });

    const sessions = await db.readingSession.findMany({
      where: { userId },
      orderBy: { sessionDate: 'desc' },
      take: 30,
    });

    // Calculate reading streak
    let streakDays = 0;
    const today = new Date().toISOString().split('T')[0];
    const uniqueDates = Array.from(new Set(sessions.map((s) => s.sessionDate))).sort().reverse();

    if (uniqueDates.length > 0) {
      let currentDate = new Date();
      for (const dateStr of uniqueDates) {
        const d = new Date(dateStr);
        const diffTime = Math.abs(currentDate.getTime() - d.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 2) {
          streakDays += 1;
          currentDate = d;
        } else {
          break;
        }
      }
    }

    const totalDurationSeconds = sessions.reduce((acc, s) => acc + s.durationSeconds, 0);

    return NextResponse.json({
      stats: {
        totalBooks,
        completedBooks,
        totalPagesRead,
        totalAnnotations,
        totalBookmarks,
        totalStickers,
        streakDays,
        totalMinutesRead: Math.round(totalDurationSeconds / 60),
        recentSessions: sessions.slice(0, 7),
      },
    });
  } catch (error) {
    console.error('Fetch stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
  }
}
