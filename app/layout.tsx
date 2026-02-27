import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "OddParty",
  description: "Create and discover small events and buy tickets."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="text-xl font-bold tracking-tight">
              OddParty
            </Link>
            <nav className="flex gap-4 text-sm">
              <Link href="/events" className="text-muted-foreground hover:text-foreground">
                Explore events
              </Link>
              <Link href="/events/new" className="text-muted-foreground hover:text-foreground">
                Create event
              </Link>
            </nav>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
