import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import { getSession } from "@/lib/session";
import { PwaRegister } from "./pwa-register";

export const metadata: Metadata = {
  title: "OddParty",
  description: "Create and discover small events and buy tickets.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/icon-192.svg", type: "image/svg+xml", sizes: "192x192" },
      { url: "/icons/icon-512.svg", type: "image/svg+xml", sizes: "512x512" }
    ],
    apple: [{ url: "/icons/icon-192.svg", type: "image/svg+xml" }]
  },
  appleWebApp: {
    capable: true,
    title: "OddParty",
    statusBarStyle: "default"
  }
};

export const viewport: Viewport = {
  themeColor: "#7c3aed"
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <html lang="en">
      <body>
        <PwaRegister />
        <header className="border-b bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="text-xl font-bold tracking-tight">
              OddParty
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/events" className="text-muted-foreground hover:text-foreground">
                Explore events
              </Link>
              <Link href="/events/new" className="text-muted-foreground hover:text-foreground">
                Create event
              </Link>
              {session?.user ? (
                <form action="/api/session/sign-out" method="post">
                  <button className="text-muted-foreground hover:text-foreground" type="submit">
                    Sign out ({session.user.name})
                  </button>
                </form>
              ) : (
                <Link href="/auth/sign-in" className="text-muted-foreground hover:text-foreground">
                  Sign in
                </Link>
              )}
            </nav>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
