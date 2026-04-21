"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Season = { id: string; name: string; year: number };
type Team = { id: string; name: string };

export default function CaptainLoginPage() {
  const router = useRouter();
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [seasonId, setSeasonId] = useState("");
  const [teamId, setTeamId] = useState("");
  const [teamCode, setTeamCode] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadSeasons() {
      const res = await fetch("/api/seasons");
      const json = await res.json();
      const list: Season[] = json.seasons || [];
      setSeasons(list);
      if (list.length > 0) {
        setSeasonId(list[0].id);
      }
    }
    loadSeasons();
  }, []);

  useEffect(() => {
    if (!seasonId) {
      setTeams([]);
      setTeamId("");
      return;
    }

    async function loadTeams() {
      const res = await fetch(`/api/seasons/${seasonId}/teams`);
      const json = await res.json();
      const list: Team[] = json.teams || [];
      setTeams(list);
      setTeamId(list[0]?.id || "");
    }

    loadTeams();
  }, [seasonId]);

  const seasonLabel = useMemo(() => {
    return seasons.find((season) => season.id === seasonId)?.name || "Select season";
  }, [seasonId, seasons]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/captain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId, teamCode, rememberMe })
      });

      if (!res.ok) {
        const json = await res.json();
        setError(json.error || "Sign in failed");
        return;
      }

      router.push("/captain/matches");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="card p-6">
      <h2 className="section-title">Captain login</h2>

      <form className="mt-6 grid gap-4" onSubmit={onSubmit}>
        {seasons.length > 1 ? (
          <label className="grid gap-2 text-sm font-semibold">
            Season
            <select
              className="rounded-xl border border-white/60 bg-white/70 px-4 py-3"
              value={seasonId}
              onChange={(event) => setSeasonId(event.target.value)}
            >
              {seasons.map((season) => (
                <option key={season.id} value={season.id}>
                  {season.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <label className="grid gap-2 text-sm font-semibold">
          Team
          <select
            className="rounded-xl border border-white/60 bg-white/70 px-4 py-3"
            value={teamId}
            onChange={(event) => setTeamId(event.target.value)}
          >
            {teams.length === 0 ? <option value="">No teams for {seasonLabel}</option> : null}
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm font-semibold">
          Team code
          <input
            value={teamCode}
            onChange={(event) => setTeamCode(event.target.value)}
            className="rounded-xl border border-white/60 bg-white/70 px-4 py-3"
            placeholder="Enter code"
          />
        </label>

        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(event) => setRememberMe(event.target.checked)}
            className="mt-0.5 h-5 w-5 rounded border-white/60 accent-moss"
          />
          <span>
            <span className="font-semibold">Trust this device for 90 days</span>
            <span className="mt-0.5 block text-stone">Stay signed in so you can submit scores faster.</span>
          </span>
        </label>

        {error ? <p className="text-sm text-red-700">{error}</p> : null}

        <button
          disabled={!teamId || !teamCode || loading}
          className="rounded-xl bg-moss px-4 py-3 font-semibold text-white disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <p className="text-sm text-stone text-center">
          Forgot your team code? Ask your commissioner.
        </p>
      </form>
    </main>
  );
}
