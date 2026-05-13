import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Live Match Tracker",
  description: "Real-time sports match dashboard built with Next.js, Express, Socket.IO and MongoDB."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen">
          <header className="border-b border-slate-200 bg-white">
            <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
              <Link href="/" className="text-lg font-bold tracking-normal text-slate-950">
                Live Match Tracker
              </Link>
              <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                <Link href="/" className="hover:text-slate-950">
                  Matches
                </Link>
                <Link href="/admin" className="hover:text-slate-950">
                  Admin
                </Link>
              </div>
            </nav>
          </header>
          <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
