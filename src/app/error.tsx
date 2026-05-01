"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="space-y-4">
      <section className="card fade-in p-6 md:p-8">
        <h2 className="section-title">Something went wrong</h2>
        <p className="mt-2 text-sm text-stone">
          We hit an unexpected error. Try again, or refresh the page.
        </p>
        {error.digest ? (
          <p className="mt-2 text-xs text-stone/80">Reference: {error.digest}</p>
        ) : null}
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={reset}
            className="tap-btn rounded-xl bg-moss px-5 py-3 text-base font-semibold text-white shadow-sm"
          >
            Try again
          </button>
          <a
            href="/"
            className="tap nav-pill nav-pill-muted text-sm font-semibold"
          >
            Back to home
          </a>
        </div>
      </section>
    </main>
  );
}
