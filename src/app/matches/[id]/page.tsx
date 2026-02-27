"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { TeamName } from "@/components/TeamName";
import { StatusBadge } from "@/components/StatusBadge";
import { SkeletonCard } from "@/components/Skeleton";
import { fetchJson } from "@/lib/clientFetch";
import { formatMatchDateTime, formatMatchTeamName, type TeamRef } from "@/lib/matchFormat";

type Match = {
  id: string;
  status: string;
  scheduled_datetime: string;
  week_number: number;
  home_team: TeamRef;
  away_team: TeamRef;
  game1_home_score: number | null;
  game1_away_score: number | null;
  game2_home_score: number | null;
  game2_away_score: number | null;
  notes: string | null;
};

export default function MatchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadMatch() {
      setLoading(true);
      setError(false);
      try {
        const { response, data } = await fetchJson<{ match?: Match }>(`/api/matches/${id}`);
        if (!response.ok) {
          setError(true);
          return;
        }
        setMatch(data.match || null);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    loadMatch();
  }, [id]);

  const hasScores =
    match &&
    (match.status === "verified" || match.status === "corrected") &&
    match.game1_home_score !== null;

  return (
    <main className="card p-4 md:p-6">
      <h2 className="section-title">Match detail</h2>

      {loading ? (
        <div className="mt-6 space-y-3">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : error || !match ? (
        <p className="mt-4 text-sm text-stone">Match not found.</p>
      ) : (
        <>
          <div className="mt-2 flex items-center gap-2">
            <StatusBadge status={match.status} />
            <span className="text-sm text-stone">
              {formatMatchDateTime(match.scheduled_datetime, {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit"
              })}
            </span>
          </div>

          <div className="mt-6 space-y-3">
            <div className="rounded-xl bg-white/70 p-4">
              <p className="text-xs uppercase tracking-wide text-stone">Teams</p>
              <div className="mt-2 flex items-center gap-2 font-semibold">
                <TeamName name={formatMatchTeamName(match.home_team)} />
                <span className="text-stone">vs</span>
                <TeamName name={formatMatchTeamName(match.away_team)} />
              </div>
            </div>

            {hasScores && (
              <div className="rounded-xl bg-white/70 p-4">
                <p className="text-xs uppercase tracking-wide text-stone">Scoreline</p>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2">
                    <TeamName name={formatMatchTeamName(match.home_team)} compact />
                    <span className="font-semibold">
                      {match.game1_home_score}, {match.game2_home_score}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TeamName name={formatMatchTeamName(match.away_team)} compact />
                    <span className="font-semibold">
                      {match.game1_away_score}, {match.game2_away_score}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {match.notes && (
              <div className="rounded-xl bg-white/70 p-4">
                <p className="text-xs uppercase tracking-wide text-stone">Notes</p>
                <p className="mt-2 text-sm">{match.notes}</p>
              </div>
            )}
          </div>
        </>
      )}
    </main>
  );
}
