import type { Metadata } from "next";
import { Fraunces, Work_Sans } from "next/font/google";
import "./globals.css";
import { OfflineSync } from "@/components/OfflineSync";

const display = Fraunces({ subsets: ["latin"], variable: "--font-display" });
const body = Work_Sans({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  metadataBase: new URL("https://bellavillabocce.com"),
  title: "Bella Villa Bocce League",
  description: "League scoring and standings for bocce play"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable}`}>
        <div className="mx-auto max-w-5xl px-4 pb-24 pt-8">
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
            <nav className="flex flex-wrap gap-3 text-sm font-semibold">
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
      </body>
    </html>
  );
}
