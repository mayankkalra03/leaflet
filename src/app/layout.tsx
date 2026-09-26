import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { RouteScrollToTop } from "@/components/RouteScrollToTop";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Leaflet | Read. Mark. Remember.",
  description: "A quieter digital reading workspace for the books and ideas worth keeping. Highlight, annotate, bookmark, add stickers, and organize your digital library.",
  keywords: ["PDF reader", "digital reading", "book library", "annotations", "highlights", "ebook workspace"],
  openGraph: {
    title: "Leaflet | Personal Digital Reading Workspace",
    description: "Read, annotate, and organize your books in a quiet, editorial digital workspace.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${jakarta.variable} antialiased`}
    >
      <body className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-sans selection:bg-[var(--accent-light)] selection:text-[var(--accent-main)]">
        <RouteScrollToTop />
        {children}
      </body>
    </html>
  );
}
