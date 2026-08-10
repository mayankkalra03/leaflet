import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';
import { db } from './db';

const DEMO_FILE_PATH = path.join(process.cwd(), 'public', 'uploads', 'leaflet-demo-sample.pdf');

export async function ensureDemoBookExists() {
  try {
    await fs.mkdir(path.dirname(DEMO_FILE_PATH), { recursive: true });
    try {
      await fs.access(DEMO_FILE_PATH);
    } catch {
      // Generate a rich, multi-page PDF sample document
      const pdfDoc = await PDFDocument.create();
      const fontSerif = await pdfDoc.embedFont(StandardFonts.TimesRoman);
      const fontBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
      const fontSans = await pdfDoc.embedFont(StandardFonts.Helvetica);

      const pages = [
        {
          chapter: 'CHAPTER I',
          title: 'The Lost Art of Focused Attention',
          content: [
            'In an era defined by relentless notifications and hyper-abundant information, true reading has become a quiet act of rebellion.',
            'Deep reading is not merely decoding symbols on a page; it is a contemplative practice that alters the structure of thought. When we immerse ourselves in a text for hours uninterrupted, our mind builds mental models of profound complexity.',
            'As Jorge Luis Borges once wrote, "I have always imagined that Paradise will be a kind of library." Yet today, our libraries are carried in our pockets, competing with infinite streams of transient content.',
            'To read deeply is to regain agency over your own focus, cultivating a space where thoughts can expand, settle, and take root.',
          ],
        },
        {
          chapter: 'CHAPTER II',
          title: 'Marginalia and the Thinking Mind',
          content: [
            'For centuries, great thinkers did not merely read books—they conversed with them. The margins of historical manuscripts from Montaigne to Jefferson are alive with ink.',
            'Marginalia turns passive consumption into active dialogue. When you underline a sentence, scribble an objection in the margin, or paste a symbol beside a resonant quote, you are codifying your own intellectual evolution.',
            'Highlights and sticky notes serve as breadcrumbs for your future self. Years later, reopening a well-marked volume reveals not just the author’s wisdom, but who you were when you first encountered it.',
            'Leaflet was designed precisely around this ritual: creating a serene canvas where reading, marking, and remembering coexist gracefully.',
          ],
        },
        {
          chapter: 'CHAPTER III',
          title: 'Architectures of Digital Peace',
          content: [
            'Most modern software treats user attention as raw material to be mined. Notification badges, red indicators, and algorithmic feeds pull us away from sustained reflection.',
            'A digital reader must be built with a different philosophy—one of intentional restraint and quiet elegance.',
            'Soft warm paper palettes, fluid typography, subtle gestures, and instant recall allow the digital medium to mirror the warmth of physical print while enhancing searchability and organization.',
            'Welcome to Leaflet. Your personal sanctuary for the books, essays, and ideas worth keeping.',
          ],
        },
      ];

      for (let i = 0; i < pages.length; i++) {
        const pageData = pages[i];
        const page = pdfDoc.addPage([600, 800]);

        // Header decoration line
        page.drawLine({
          start: { x: 50, y: 740 },
          end: { x: 550, y: 740 },
          thickness: 1,
          color: rgb(0.8, 0.75, 0.7),
        });

        // Chapter tag
        page.drawText(pageData.chapter, {
          x: 50,
          y: 715,
          size: 11,
          font: fontSans,
          color: rgb(0.79, 0.35, 0.23), // Rust accent
        });

        // Title
        page.drawText(pageData.title, {
          x: 50,
          y: 685,
          size: 22,
          font: fontBold,
          color: rgb(0.11, 0.1, 0.09),
        });

        // Paragraphs
        let currentY = 640;
        for (const para of pageData.content) {
          const words = para.split(' ');
          let line = '';
          for (const word of words) {
            const testLine = line ? `${line} ${word}` : word;
            const textWidth = fontSerif.widthOfTextAtSize(testLine, 14);
            if (textWidth > 500) {
              page.drawText(line, {
                x: 50,
                y: currentY,
                size: 14,
                font: fontSerif,
                color: rgb(0.2, 0.18, 0.16),
              });
              currentY -= 22;
              line = word;
            } else {
              line = testLine;
            }
          }
          if (line) {
            page.drawText(line, {
              x: 50,
              y: currentY,
              size: 14,
              font: fontSerif,
              color: rgb(0.2, 0.18, 0.16),
            });
            currentY -= 36;
          }
        }

        // Footer Page Number
        page.drawText(`Leaflet Demo Reader  •  Page ${i + 1} of ${pages.length}`, {
          x: 210,
          y: 40,
          size: 10,
          font: fontSans,
          color: rgb(0.5, 0.48, 0.45),
        });
      }

      const pdfBytes = await pdfDoc.save();
      await fs.writeFile(DEMO_FILE_PATH, pdfBytes);
    }
  } catch (err) {
    console.error('Error generating demo PDF:', err);
  }
}

export async function getOrCreateDemoBook(userId: string) {
  await ensureDemoBookExists();

  let book = await db.book.findFirst({
    where: {
      userId,
      isDemo: true,
    },
  });

  if (!book) {
    book = await db.book.create({
      data: {
        userId,
        title: 'The Art of Deep Reading',
        author: 'Leaflet Editions',
        description: 'A sample volume exploring marginalia, focus, and digital peace.',
        fileUrl: '/uploads/leaflet-demo-sample.pdf',
        fileSize: 45000,
        totalPages: 3,
        isDemo: true,
        isFavorite: true,
      },
    });

    await db.readingProgress.create({
      data: {
        userId,
        bookId: book.id,
        currentPage: 1,
        progressPercent: 33.3,
      },
    });

    // Add initial sample annotation & sticker to make demo instant-wow!
    await db.annotation.create({
      data: {
        userId,
        bookId: book.id,
        pageNumber: 1,
        selectedText: 'deep reading is not merely decoding symbols on a page; it is a contemplative practice that alters the structure of thought.',
        color: '#fef08a',
        note: 'Resonates deeply with the core philosophy of Leaflet.',
        type: 'highlight',
      },
    });

    await db.sticker.create({
      data: {
        userId,
        bookId: book.id,
        pageNumber: 1,
        emoji: '💡',
        xPercent: 78,
        yPercent: 22,
        scale: 1.2,
      },
    });
  }

  return book;
}
