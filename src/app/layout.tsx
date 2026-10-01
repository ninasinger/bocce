import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { OfflineSync } from "@/components/OfflineSync";
import { BottomNav } from "@/components/BottomNav";
import { DesktopNav } from "@/components/DesktopNav";
import { SessionIndicator } from "@/components/SessionIndicator";
import { MajolicaBand } from "@/components/MajolicaBand";

// Off-season: every page shows only the banner. Set to false to restore the site.
const OFF_SEASON = false;

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display"
});
const body = Source_Sans_3({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  metadataBase: new URL("https://bellavillabocce.com"),
  title: "John Pirelli Lodge Bocce",
  description: "Schedules and standings for John Pirelli Lodge Bocce",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    // Home-screen labels truncate past ~12 characters.
    title: "Pirelli Bocce"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1E4E9C",
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
        <MajolicaBand />
        {OFF_SEASON ? (
          <main className="flex min-h-[calc(100dvh-1.5rem)] items-center justify-center px-4">
            <div className="card px-8 py-12 text-center md:px-16 md:py-16">
              <h1 className="font-display text-4xl font-bold italic text-cobalt md:text-6xl">
                John Pirelli Lodge Bocce
              </h1>
              <p className="mt-4 font-display text-2xl text-ink md:text-3xl">See you next season!</p>
            </div>
          </main>
        ) : (
        <>
        <div className="app-shell mx-auto max-w-5xl pt-6 md:pt-8">
          <header className="site-header mb-6 flex flex-col gap-3 md:mb-10 md:flex-row md:items-center md:justify-between">
            <h1 className="font-display text-4xl font-bold italic leading-none text-cobalt md:text-5xl">
              John Pirelli Lodge Bocce
            </h1>
            <div className="flex flex-col items-start gap-2 md:items-end">
              <DesktopNav />
              <SessionIndicator />
            </div>
          </header>
          <OfflineSync />
          {children}
        </div>
        <BottomNav />
        </>
        )}
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js')}`
          }}
        />
      </body>
    </html>
  );
}
