# Leaflet — Personal Digital Reading Workspace

> **"Read. Mark. Remember."**  
> *A quiet, editorial digital sanctuary for the books, PDFs, and ideas worth keeping.*

Leaflet is a production-quality full-stack digital book and PDF reading application built from scratch with **Next.js 14+ (App Router)**, **TypeScript**, **Tailwind CSS**, **Prisma ORM**, **PDF.js**, and custom marginalia tools (contextual highlights, sticky notes, drag-and-drop page stickers, PDF search, reading progress persistence, a centralized Notes Workspace, and reading statistics).

---

## 🎨 Visual & Design Direction

Leaflet follows a paper-inspired design system:
- **Warm Ivory / Cream Palette**: `--bg-main: #F9F6F0`, off-white surfaces `#FFFFFF`, charcoal typography `#1C1917`, and muted rust accent `#C95A3B`.
- **Editorial Typography**: Serif headings (*Playfair Display*) paired with clean UI typography (*Plus Jakarta Sans*).
- **Reader Themes**: Dynamic theme switching between Light, Sepia Paper (`#F4ECD8`), and Dark mode (`#121110`).
- **Subtle Motion**: Floating book covers and curved dashed vector connectors inspired by modern digital publishing aesthetics.

---

## ✨ Features

- 📖 **PDF Reader Engine**: Powered by `pdfjs-dist` with high DPI rendering, text layer extraction, single/continuous page view, zoom controls (50% - 200%), fit width/page modes.
- 🖍️ **Contextual Highlighting**: Select text to reveal a floating toolbar with 5 highlight colors (Yellow, Green, Blue, Pink, Orange) and sticky note capabilities.
- 🎨 **Interactive Page Stickers**: Drag, drop, scale, rotate, and position emoji stickers (⭐ ❤️ 💡 🔥 ❗ 🤔 😂 📌) directly on PDF pages.
- 🔖 **Bookmarks & Table of Contents**: Extract document TOC outlines and bookmark pages with quick jump navigation.
- 🔍 **PDF Text Search**: Search entire PDF documents with highlighted text snippets and page jump targets without freezing the UI.
- ⚡ **Auto-saved Reading Progress**: Debounced persistence tracking current page, percentage, and reading sessions. Resumes where you left off.
- 📝 **Notes Workspace (`/notes`)**: Centralized aggregate overview of all quotes, highlights, and thoughts across your library with **Markdown (`.md`)** and **JSON (`.json`)** export tools.
- 📊 **Reading Statistics (`/stats`)**: Personal statistics tracking books finished, total pages read, focus time, active reading streak (days), and marginalia breakdown.
- 🔒 **Security & Authentication**: Server-side JWT authentication, HTTP-only cookie sessions, password hashing (`bcryptjs`), and user ownership checks.
- 🚀 **Zero-Config Demo Mode**: Instant interactive demo book (*The Art of Deep Reading*) accessible directly from the landing page without requiring account setup or PDF uploads.

---

## 🏗️ Architecture & Technology Stack

- **Framework**: Next.js 16 (App Router, Server Actions & Route Handlers)
- **Language**: TypeScript (Strict mode)
- **Styling**: Tailwind CSS + CSS Custom Design Tokens
- **Database & ORM**: Prisma ORM with SQLite engine for out-of-the-box local execution + PostgreSQL migration readiness
- **Auth**: JWT Session Cookies (HTTP-only) + bcryptjs password hashing
- **PDF Engine**: `pdfjs-dist` client canvas renderer + `pdf-lib` server metadata parser
- **Storage**: Dual driver (Local `/public/uploads` API for local development + Cloudflare R2 / AWS S3 standard adapter readiness)

---

## 🗄️ Database Schema

```prisma
model User {
  id           String           @id @default(uuid())
  email        String           @unique
  name         String
  passwordHash String
  createdAt    DateTime         @default(now())
  updatedAt    DateTime         @updatedAt
  books        Book[]
  progress     ReadingProgress[]
  annotations  Annotation[]
  bookmarks    Bookmark[]
  stickers     Sticker[]
  sessions     ReadingSession[]
  preference   UserPreference?
}

model Book {
  id          String            @id @default(uuid())
  userId      String
  user        User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  title       String
  author      String            @default("Unknown Author")
  description String?
  coverUrl    String?
  fileUrl     String
  fileSize    Int               @default(0)
  totalPages  Int               @default(1)
  isFavorite  Boolean           @default(false)
  isDemo      Boolean           @default(false)
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt
  progress    ReadingProgress[]
  annotations Annotation[]
  bookmarks   Bookmark[]
  stickers    Sticker[]
  sessions    ReadingSession[]

  @@index([userId])
}

model ReadingProgress {
  id              String   @id @default(uuid())
  userId          String
  bookId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  book            Book     @relation(fields: [bookId], references: [id], onDelete: Cascade)
  currentPage     Int      @default(1)
  progressPercent Float    @default(0)
  lastReadAt      DateTime @default(now())
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@unique([userId, bookId])
}

model Annotation {
  id           String   @id @default(uuid())
  userId       String
  bookId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  book         Book     @relation(fields: [bookId], references: [id], onDelete: Cascade)
  pageNumber   Int
  selectedText String
  textPrefix   String?
  textSuffix   String?
  startOffset  Int?
  endOffset    Int?
  color        String   @default("#fef08a")
  note         String?
  type         String   @default("highlight")
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([userId, bookId, pageNumber])
}

model Bookmark {
  id         String   @id @default(uuid())
  userId     String
  bookId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  book       Book     @relation(fields: [bookId], references: [id], onDelete: Cascade)
  pageNumber Int
  title      String?
  note       String?
  createdAt  DateTime @default(now())

  @@unique([userId, bookId, pageNumber])
}

model Sticker {
  id         String   @id @default(uuid())
  userId     String
  bookId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  book       Book     @relation(fields: [bookId], references: [id], onDelete: Cascade)
  pageNumber Int
  emoji      String
  xPercent   Float
  yPercent   Float
  scale      Float    @default(1.0)
  rotation   Float    @default(0.0)
  createdAt  DateTime @default(now())

  @@index([userId, bookId, pageNumber])
}

model ReadingSession {
  id              String   @id @default(uuid())
  userId          String
  bookId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  book            Book     @relation(fields: [bookId], references: [id], onDelete: Cascade)
  durationSeconds Int      @default(0)
  pagesRead       Int      @default(0)
  sessionDate     String
  createdAt       DateTime @default(now())

  @@index([userId, sessionDate])
}

model UserPreference {
  id             String   @id @default(uuid())
  userId         String   @unique
  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  theme          String   @default("light")
  readerTheme    String   @default("light")
  readerZoom     Float    @default(1.0)
  pageLayoutMode String   @default("continuous")
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
```

---

## 🛠️ Local Development Setup

No cloud credentials or external API keys are required for local execution!

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/leaflet.git
cd leaflet
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Default `.env`:
```env
DATABASE_URL="file:./leaflet.db"
JWT_SECRET="leaflet_jwt_secret_dev_key_849204820194819"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Initialize Local Database
```bash
npx prisma db push
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Production Deployment Guide

Leaflet is designed for zero recurring infrastructure costs on free tiers:

1. **Frontend & Server Actions**: Deploy to **Vercel**.
2. **Database**: Provision a free PostgreSQL database on **Supabase** or **Neon**.
   - Update `schema.prisma` provider to `postgresql`.
   - Set `DATABASE_URL` in Vercel environment variables.
3. **Object Storage**: Use **Cloudflare R2** or **AWS S3** for uploaded PDF books.
   - Configure `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`.

---

## 💡 Technical Rationale & Architectural Decisions

- **Why PostgreSQL & SQLite Dual Engine?**: SQLite provides instant zero-setup local development for reviewers and developers, while Prisma schema easily converts to PostgreSQL for Vercel/Supabase production deployments.
- **Why Separate Object Storage from Relational DB?**: Storing large binary PDF files directly inside PostgreSQL bloats database size and degrades query performance. PDFs are stored in object storage or local media routes, while PostgreSQL stores structured metadata.
- **Normalized Sticker Coordinate Model**: Stickers store relative percentages (`xPercent`, `yPercent`) rather than static pixel offsets, ensuring stickers remain perfectly positioned across different screen dimensions and zoom levels.
- **Debounced Progress Persistence**: To prevent spamming the database during rapid scrolling, reading progress updates are throttled via client-side debouncing (800ms window).

---

## 📄 License

MIT License. Designed and crafted for developers and readers everywhere.
