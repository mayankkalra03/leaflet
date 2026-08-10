<div align="center">

# 📖 Leaflet

### *Personal Digital Reading Workspace & PDF Sanctuary*

**"Read. Mark. Remember."**  
*A quiet, editorial digital sanctuary for the books, PDFs, and ideas worth keeping.*

[**🌐 Experience Live Application →**](https://leaflet-beryl.vercel.app/)

<br />

[![Live Demo](https://img.shields.io/badge/Live_Demo-leaflet--beryl.vercel.app-C95A3B?style=for-the-badge&logo=vercel&logoColor=white)](https://leaflet-beryl.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38BDF8?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma_ORM-6.3-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-amber?style=for-the-badge)](LICENSE)

</div>

---

## 🌟 Overview

**Leaflet** is a production-quality full-stack digital book reading application built from scratch. Designed with an editorial paper-inspired aesthetic, Leaflet turns PDF reading into an interactive, delightful workflow with real-time text highlights, inline sticky notes, drag-and-drop page stickers, full-text PDF search, auto-saved reading progress, reading session analytics, and a centralized Notes Workspace with Markdown export.

---

## ✨ Key Features

- 📖 **High-Performance PDF Engine**: Canvas-based PDF rendering with sub-pixel text layer extraction, dynamic scale calculation, and Fit Width / Fit Page modes.
- ✍️ **Contextual Highlighting & Marginalia**: Highlight text in 5 warm colors (Yellow, Green, Blue, Pink, Orange) and attach sticky notes.
- 🎨 **Interactive Drag-and-Drop Page Stickers**: Place emoji stickers (⭐ ❤️ 💡 🔥 ❗ 🤔 😂 📌) anywhere on a book page with normalized percentage coordinate persistence.
- 🔍 **Document TOC & Full-Text Search**: Chronologically sorted chapter tree outline with deep content text searching and snippet preview targets.
- 📑 **Bookmarks & Reading Progress**: Resume exact page reading progress with debounced persistence and reading percentage indicators.
- 📝 **Notes Workspace (`/notes`)**: Centralized overview of all quotes, highlights, and thoughts across your library with **Markdown (`.md`)** and **JSON (`.json`)** export tools.
- 📊 **Reading Analytics Workspace (`/stats`)**: Personal statistics tracking finished books, total pages read, focus time, active reading streak (days), and marginalia distribution.
- 🌗 **Adaptive Themes**: Switch seamlessly between Warm Ivory Light, Sepia Paper (`#F4ECD8`), and OLED Dark Mode (`#161514`).

---

## 🏗️ Architecture & Stack Overview

```mermaid
flowchart TD
    Client["Client Browser (Next.js 16 App Router)"] --> Auth["JWT Auth Middleware & Routes"]
    Client --> PDF["PDF.js Canvas & Text Layer Engine"]
    Auth --> API["Next.js Server API Routes"]
    API --> Prisma["Prisma ORM"]
    Prisma --> DB[("Supabase PostgreSQL Cloud DB")]
```

---

## 🗄️ Database Entity-Relationship Diagram

```mermaid
erDiagram
    USER ||--o{ BOOK : owns
    USER ||--o{ READING_PROGRESS : tracks
    USER ||--o{ ANNOTATION : creates
    USER ||--o{ STICKER : places
    USER ||--o{ READING_SESSION : logs

    BOOK ||--o{ READING_PROGRESS : has
    BOOK ||--o{ ANNOTATION : contains
    BOOK ||--o{ STICKER : contains
```

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Live App** | [https://leaflet-beryl.vercel.app/](https://leaflet-beryl.vercel.app/) |
| **Framework** | Next.js 16 (App Router, Server Actions, API Route Handlers) |
| **Language** | TypeScript (Strict type checking) |
| **Styling** | Tailwind CSS v4 + Custom CSS Design Tokens |
| **Database & ORM** | PostgreSQL (Supabase) + Prisma ORM |
| **Authentication** | Server-side JWT HTTP-only Cookies + bcryptjs Password Hashing |
| **PDF Rendering** | `pdfjs-dist` (Canvas & Text Layer) + `pdf-lib` (Metadata) |

---

## 🚀 Quick Start (Local Development)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/mayankkalra03/leaflet.git
cd leaflet
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Set your local `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/leaflet"
JWT_SECRET="your_secure_jwt_secret_key_here"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Initialize Database & Run
```bash
npx prisma db push
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 💡 Engineering Highlights

- **Normalized Percentage Coordinate System**: Page stickers store relative `xPercent` and `yPercent` positions rather than static pixel offsets, ensuring stickers remain perfectly positioned across all device viewport sizes, tablet screens, and zoom scales.
- **Debounced Progress Persistence**: To prevent database request throttling during rapid page flipping, reading progress updates are debounced on the client (800ms window).
- **Sub-Pixel High DPI Canvas Scaling**: Calculates hardware device pixel ratio (`window.devicePixelRatio`) to render crystal-clear PDF typography without blurriness on Retina displays.
- **Chronological TOC Outline Sorting**: Automatically extracts nested document outline node trees and orders chapter entries chronologically by page number.

---

## 📜 License

Distributed under the **MIT License**. Created with care for readers and developers everywhere.
