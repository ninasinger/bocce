import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

type ScheduleRow = {
  date: string;
  court: string;
  homeTeam: string;
  awayTeam: string;
};

const FINAL_TEAM_NAMES = [
  "Bocce Babes",
  "Bocce Bellas",
  "Bocce Mammas",
  "Bocce Stars",
  "Cannoli Hope",
  "D'Bocceri",
  "Dolls With Balls",
  "Donne Dolci",
  "Donne Vere",
  "La Bocce Vita",
  "Let's Roll",
  "Limoncello Sorellas",
  "Movin Balls",
  "Quattro Amici",
  "Roll Models",
  "Viva La Bocce",
  "Wonder Women"
];

function parseCsvLine(line: string) {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === "\"") {
      if (inQuotes && line[index + 1] === "\"") {
        current += "\"";
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current);
  return values;
}

function parseCsvSchedule(filePath: string): ScheduleRow[] {
  return fs
    .readFileSync(filePath, "utf8")
    .trim()
    .split(/\r?\n/)
    .slice(1)
    .map((line) => {
      const [date, , , court, homeTeam, awayTeam] = parseCsvLine(line);
      return { date, court, homeTeam, awayTeam };
    });
}

function parseSqlSchedule(filePath: string): ScheduleRow[] {
  const sql = fs.readFileSync(filePath, "utf8");
  const pattern =
    /values \(\s*v_season_id,\s*\d+,\s*\(\(date '([^']+)' \+ time '18:30'\) at time zone 'America\/New_York'\),\s*\(select id from teams where season_id = v_season_id and name = '((?:''|[^'])+)'\),\s*\(select id from teams where season_id = v_season_id and name = '((?:''|[^'])+)'\),\s*'scheduled',\s*'([^']+)'\s*\);/g;

  const rows: ScheduleRow[] = [];
  for (const match of sql.matchAll(pattern)) {
    rows.push({
      date: match[1],
      homeTeam: match[2].replace(/''/g, "'"),
      awayTeam: match[3].replace(/''/g, "'"),
      court: match[4]
    });
  }

  return rows;
}

function validateSchedule(label: string, rows: ScheduleRow[]) {
  assert.ok(rows.length > 0, `${label} should contain schedule rows`);

  const teamCountsByDate = new Map<string, Map<string, number>>();
  const courtsByDate = new Map<string, Set<string>>();

  for (const row of rows) {
    assert.match(
      row.court,
      /(?:Court\s*)?\d+/i,
      `${label} is missing a court number for ${row.homeTeam} vs ${row.awayTeam} on ${row.date}`
    );

    const normalizedDate = row.date;
    const teamCounts = teamCountsByDate.get(normalizedDate) ?? new Map<string, number>();
    teamCounts.set(row.homeTeam, (teamCounts.get(row.homeTeam) ?? 0) + 1);
    teamCounts.set(row.awayTeam, (teamCounts.get(row.awayTeam) ?? 0) + 1);
    teamCountsByDate.set(normalizedDate, teamCounts);

    const courts = courtsByDate.get(normalizedDate) ?? new Set<string>();
    assert.ok(!courts.has(row.court), `${label} reuses ${row.court} on ${row.date}`);
    courts.add(row.court);
    courtsByDate.set(normalizedDate, courts);
  }

  for (const [date, teamCounts] of teamCountsByDate) {
    const duplicates = [...teamCounts.entries()].filter(([, count]) => count > 1);
    assert.deepEqual(
      duplicates,
      [],
      `${label} schedules the same team more than once on ${date}: ${duplicates
        .map(([team, count]) => `${team} x${count}`)
        .join(", ")}`
    );
  }

  const teams = new Set<string>();
  for (const row of rows) {
    teams.add(row.homeTeam);
    teams.add(row.awayTeam);
  }

  assert.deepEqual(
    [...teams].sort(),
    [...FINAL_TEAM_NAMES].sort(),
    `${label} does not match the final 2026 team-name set`
  );
}

test("2026 CSV schedule avoids same-night duplicate teams and keeps court numbers", () => {
  validateSchedule(
    "Bocce_Schedule_2026.csv",
    parseCsvSchedule(path.join(process.cwd(), "supabase/seeds/Bocce_Schedule_2026.csv"))
  );
});

test("2026 SQL seed files match the same schedule integrity rules", () => {
  validateSchedule(
    "2026_schedule.sql",
    parseSqlSchedule(path.join(process.cwd(), "supabase/seeds/2026_schedule.sql"))
  );
  validateSchedule(
    "0011_sync_2026_schedule_from_txt.sql",
    parseSqlSchedule(path.join(process.cwd(), "supabase/migrations/0011_sync_2026_schedule_from_txt.sql"))
  );
});
