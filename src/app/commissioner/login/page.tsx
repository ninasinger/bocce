"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Season = { id: string; name: string; year: number };

export default function CommissionerLoginPage() {
  const router = useRouter();
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [seasonId, setSeasonId] = useState("");
  const [commissionerCode, setCommissionerCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadSeasons() {
      try {
        const res = await fetch("/api/seasons");
        const text = await res.text();
        const json = text ? JSON.parse(text) : {};
        const list: Season[] = json.seasons || [];
        setSeasons(list);
        setSeasonId(list[0]?.id || "");
      } catch {
        setError("Could not load seasons");
      }
    }

    loadSeasons();
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/commissioner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seasonId, commissionerCode })
      });

      const text = await res.text();
      const json = text ? JSON.parse(text) : {};
      if (!res.ok) {
        setError(json.error || "Sign in failed");
        return;
      }

      router.push("/commissioner");
    } catch {
      setError("Sign in failed");
    } finally {
      setLoading(false);
    }
  }

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
      <h2 className="section-title">Commissioner access</h2>
      <p className="mt-2 text-sm text-stone">
        Select season and enter the commissioner code.
      </p>
      <p className="mt-2 text-xs text-stone">Current default commissioner code: 1234</p>

      <form className="mt-6 grid gap-4" onSubmit={onSubmit}>
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
                {season.name} ({season.year})
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm font-semibold">
          Commissioner code
          <input
            className="rounded-xl border border-white/60 bg-white/70 px-4 py-3"
            placeholder="Enter commissioner code"
            value={commissionerCode}
            onChange={(event) => setCommissionerCode(event.target.value)}
          />
        </label>

        {error ? <p className="text-sm text-red-700">{error}</p> : null}

        <button
          disabled={!seasonId || !commissionerCode || loading}
          className="rounded-xl bg-moss px-4 py-3 font-semibold text-white disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Continue"}
        </button>
        <button
          type="button"
          onClick={signInWithGoogle}
          className="rounded-xl bg-white/80 px-4 py-3 font-semibold"
        >
          Sign in with Gmail
        </button>
      </form>
    </main>
  );
}
