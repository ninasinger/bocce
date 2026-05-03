"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { TeamName } from "@/components/TeamName";
import { StatusBadge } from "@/components/StatusBadge";
import { fetchJson } from "@/lib/clientFetch";
import { formatMatchDateTime, formatMatchTeamName, type TeamRef } from "@/lib/matchFormat";

type MatchRow = {
  id: string;
  week_number: number;
  scheduled_datetime: string | null;
  status: string;
  home_team: TeamRef;
  away_team: TeamRef;
};

export default function HomePage() {
  const [captainNextMatch, setCaptainNextMatch] = useState<MatchRow | null>(null);

  useEffect(() => {
    async function loadCaptainNext() {
      const { response, data } = await fetchJson<{ matches?: MatchRow[] }>("/api/my/matches");
      if (!response.ok) {
        setCaptainNextMatch(null);
        return;
      }
      const list = data.matches || [];
      const next = list.find((match) => match.status === "awaiting_submission") || null;
      setCaptainNextMatch(next);
    }

    loadCaptainNext();
  }, []);
  return (
    <main className="space-y-6">
      {captainNextMatch ? (
        <section className="card fade-in border-2 border-moss/30 bg-moss/5 p-4 md:p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-moss">Your next match</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusBadge status={captainNextMatch.status} />
            <span className="text-sm text-stone">
              Week {captainNextMatch.week_number}
              {captainNextMatch.scheduled_datetime
                ? ` · ${formatMatchDateTime(captainNextMatch.scheduled_datetime, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit"
                  })}`
                : ""}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-lg font-display">
            <TeamName name={formatMatchTeamName(captainNextMatch.home_team)} />
            <span className="text-stone">vs</span>
            <TeamName name={formatMatchTeamName(captainNextMatch.away_team)} />
          </div>
          <Link
            href={`/captain/matches/${captainNextMatch.id}/submit`}
            className="tap-btn mt-3 inline-flex items-center justify-center rounded-xl bg-moss px-5 py-3 text-base font-semibold text-white shadow-sm"
          >
            Submit scores
          </Link>
        </section>
      ) : null}

      <section className="card p-4 md:p-6">
        <h2 className="section-title">League documents</h2>
        <p className="mt-1 text-sm text-stone">Download the 2026 roster and official rules.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href="/documents/2026-roster.pdf"
            download
            className="tap nav-pill nav-pill-muted text-sm font-semibold"
          >
            📋 2026 Roster (PDF)
          </a>
          <a
            href="/documents/2026-rules.pdf"
            download
            className="tap nav-pill nav-pill-muted text-sm font-semibold"
          >
            📖 2026 Rules (PDF)
          </a>
        </div>
      </section>
    </main>
  );
}
