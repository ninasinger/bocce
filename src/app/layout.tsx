import type { Metadata, Viewport } from "next";
import { Fraunces, Work_Sans } from "next/font/google";
import "./globals.css";
import { OfflineSync } from "@/components/OfflineSync";
import { BottomNav } from "@/components/BottomNav";
import { DesktopNav } from "@/components/DesktopNav";
import { SessionIndicator } from "@/components/SessionIndicator";

// Off-season: every page shows only the banner. Set to false to restore the site.
const OFF_SEASON = false;

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
  width: "device-width",
  initialScale: 1,
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
        {OFF_SEASON ? (
          <main className="flex min-h-screen items-center justify-center px-4">
            <div className="card px-8 py-12 text-center md:px-16 md:py-16">
              <p className="badge bg-sun/30 text-ink">Bella Villa Bocce League</p>
              <h1 className="mt-4 text-4xl font-display md:text-6xl">
                See you next season!
              </h1>
            </div>
          </main>
        ) : (
        <>
        <div className="app-shell mx-auto max-w-5xl pt-6 md:pt-8">
          <header className="site-header mb-6 flex flex-col gap-3 md:mb-10 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="site-badge badge bg-sun/30 text-ink">Bocce League</p>
              <h1 className="mt-2 text-3xl font-display md:mt-3 md:text-4xl">
                League Scoring Hub
              </h1>
            </div>
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
