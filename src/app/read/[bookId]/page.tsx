import { notFound, redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { ClientPdfReader } from '@/components/reader/ClientPdfReader';

export default async function ReadPage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const session = await getAuthUser();
  const { bookId } = await params;

  let userId = session?.userId;

  if (!userId) {
    const demoBook = await db.book.findFirst({
      where: { id: bookId, isDemo: true },
    });

    if (!demoBook) {
      redirect('/login');
    }
  }

  const book = await db.book.findFirst({
    where: {
      id: bookId,
      ...(userId ? { userId } : {}),
    },
    include: {
      progress: userId ? { where: { userId } } : false,
    },
  });

  if (!book) {
    notFound();
  }

  const formattedBook = {
    ...book,
    progress: (book as any).progress?.[0] || null,
  };

  return <ClientPdfReader book={formattedBook} />;
}
