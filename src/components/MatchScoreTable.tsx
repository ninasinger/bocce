import type { ReactNode } from "react";
import { buildScoreTable, type ScoreSide, type ScoreTableMatch } from "@/lib/scoreTable";

function teamClass(side: ScoreSide) {
  if (side.result === "win") return "font-bold text-ink";
  if (side.result === "loss") return "text-slate";
  return "font-semibold text-ink";
}

function totalClass(side: ScoreSide) {
  return side.result === "loss" ? "text-slate/60" : "text-cobalt";
}

export function MatchScoreTable({
  match,
  home,
  away
}: {
  match: ScoreTableMatch;
  home: ReactNode;
  away: ReactNode;
}) {
  const table = buildScoreTable(match);
  const columns = table.showGames
    ? "grid-cols-[minmax(0,1fr)_1.5rem_1.5rem_2.25rem]"
    : table.showScores
      ? "grid-cols-[minmax(0,1fr)_2.25rem]"
      : "grid-cols-1";

  const rows: Array<[ReactNode, ScoreSide]> = [
    [home, table.home],
    [away, table.away]
  ];

  return (
    <div className={`grid items-center gap-x-2 gap-y-1.5 ${columns}`}>
      {table.showGames ? (
        <>
          <span />
          <span className="text-center text-xs font-semibold text-slate">G1</span>
          <span className="text-center text-xs font-semibold text-slate">G2</span>
          <span className="text-right text-xs font-semibold text-slate">Tot</span>
        </>
      ) : null}
      {rows.map(([team, side], index) => (
        <div key={index} className="contents">
          <div className={`min-w-0 ${teamClass(side)}`}>{team}</div>
          {side.games.map((score, gameIndex) => (
            <span
              key={gameIndex}
              className={`text-center tabular-nums ${side.result === "loss" ? "text-slate" : "text-ink"}`}
            >
              {score}
            </span>
          ))}
          {table.showScores ? (
            <span
              className={`text-right font-display text-2xl font-bold leading-none lining-nums tabular-nums ${totalClass(side)}`}
            >
              {side.total}
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}
