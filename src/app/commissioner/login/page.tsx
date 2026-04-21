"use client";

import { useEffect, useState } from "react";
import { fetchJson } from "@/lib/clientFetch";

type Season = { id: string; name: string; year: number };

export default function CommissionerLoginPage() {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [seasonId, setSeasonId] = useState("");
  const [error, setError] = useState("");
  const [oauthErrorMessage, setOauthErrorMessage] = useState("");

  useEffect(() => {
    const oauthError = new URLSearchParams(window.location.search).get("error");
    if (oauthError === "email_not_allowed") {
      setOauthErrorMessage("Only commissioners can log in to the commissioner portal at this time.");
    }
  }, []);

  useEffect(() => {
    async function loadSeasons() {
      try {
        const { data } = await fetchJson<{ seasons?: Season[] }>("/api/seasons");
        const list: Season[] = data.seasons || [];
        setSeasons(list);
        setSeasonId(list[0]?.id || "");
      } catch {
        setError("Could not load seasons");
      }
    }

    loadSeasons();
  }, []);

  function signInWithGoogle() {
    if (!seasonId) {
      setError("Select a season first");
      return;
    }
    window.location.href = `/api/auth/google/start?mode=login&seasonId=${encodeURIComponent(
      seasonId
    )}`;
  }

  return (
    <main className="card p-6">
      <h2 className="section-title">Commissioner Access</h2>
      <p className="mt-2 text-sm text-stone">
        Sign in with your Google account to manage the league.
      </p>

      <div className="mt-6 grid gap-4">
        <label className="grid gap-2 text-sm font-semibold">
          Season
          <select
            className="rounded-xl border border-white/60 bg-white/70 px-4 py-3"
            value={seasonId}
            onChange={(event) => setSeasonId(event.target.value)}
          >
            {seasons.length === 0 ? <option value="">No seasons found</option> : null}
            {seasons.map((season) => (
              <option key={season.id} value={season.id}>
                {season.name}
              </option>
            ))}
          </select>
        </label>

        {oauthErrorMessage ? <p className="text-sm text-red-700">{oauthErrorMessage}</p> : null}
        {error ? <p className="text-sm text-red-700">{error}</p> : null}

        <button
          onClick={signInWithGoogle}
          disabled={!seasonId}
          className="flex items-center justify-center gap-3 rounded-xl border border-moss/30 bg-moss/10 px-4 py-3.5 font-semibold text-ink shadow-sm ring-1 ring-moss/20 transition-all hover:bg-moss/15 active:scale-[0.98] disabled:opacity-50"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm">
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          </span>
          Sign in with Google
        </button>
      </div>
    </main>
  );
}
