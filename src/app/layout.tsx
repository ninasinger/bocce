import type { Metadata, Viewport } from "next";
import { Fraunces, Work_Sans } from "next/font/google";
import "./globals.css";
import { OfflineSync } from "@/components/OfflineSync";
import { BottomNav } from "@/components/BottomNav";

const display = Fraunces({ subsets: ["latin"], variable: "--font-display" });
const body = Work_Sans({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  metadataBase: new URL("https://bellavillabocce.com"),
  title: "Bella Villa Bocce League",
  description: "League scoring and standings for bocce play",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Bocce"
  }
};

export const viewport: Viewport = {
  themeColor: "#2f5d50",
  viewportFit: "cover"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.svg" />
        <link rel="icon" href="/icon-192.svg" type="image/svg+xml" />
      </head>
      <body className={`${display.variable} ${body.variable}`}>
        <div className="mx-auto max-w-5xl px-4 pb-28 pt-8">
          <header className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="badge bg-sun/30 text-ink">Bocce League</p>
              <h1 className="mt-3 text-3xl font-display md:text-4xl">
                League Scoring Hub
              </h1>
              <p className="mt-2 text-sm text-stone">
                Verified results, accurate standings, and simple captain submissions.
              </p>
            </div>
            <nav className="hidden flex-wrap gap-3 text-sm font-semibold md:flex">
              <a className="rounded-full bg-white/80 px-4 py-2" href="/">
                Home
              </a>
              <a className="rounded-full bg-white/80 px-4 py-2" href="/standings">
                Standings
              </a>
              <a className="rounded-full bg-white/80 px-4 py-2" href="/schedule">
                Schedule
              </a>
              <a className="rounded-full bg-white/80 px-4 py-2" href="/captain/login">
                Score Entry
              </a>
              <a
                className="rounded-full bg-moss/90 px-4 py-2 text-white"
                href="/commissioner/login"
              >
                Commissioner
              </a>
            </nav>
          </header>
          <OfflineSync />
          {children}
        </div>
        <BottomNav />
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js')}`
          }}
        />
      </body>
    </html>
  );
}
