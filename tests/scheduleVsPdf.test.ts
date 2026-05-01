import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

// Canonical schedule, transcribed from /Users/nina/Downloads/2026 Bocce Schedule_FINAL.pdf.
// PDF is the authoritative source; CSV/SQL data must match.
type PdfMatch = {
  date: string; // YYYY-MM-DD
  dayOfWeek: "Tuesday" | "Thursday";
  week: number;
  court: number;
  home: string;
  away: string;
};

const PDF_SCHEDULE: PdfMatch[] = [
  // Week 1 - Thursday, May 7
  { date: "2026-05-07", dayOfWeek: "Thursday", week: 1, court: 1, home: "Dolls with Balls", away: "Quattro Amici" },
  { date: "2026-05-07", dayOfWeek: "Thursday", week: 1, court: 2, home: "Let's Roll", away: "Bocce Stars" },
  { date: "2026-05-07", dayOfWeek: "Thursday", week: 1, court: 3, home: "D'Bocceri", away: "Wonder Women" },
  { date: "2026-05-07", dayOfWeek: "Thursday", week: 1, court: 4, home: "Bocce Babes", away: "Donne Dolce" },
  { date: "2026-05-07", dayOfWeek: "Thursday", week: 1, court: 5, home: "Limoncello Sorellas", away: "Bocce Bellas" },
  { date: "2026-05-07", dayOfWeek: "Thursday", week: 1, court: 6, home: "Movin' Balls", away: "Viva la Bocce" },

  // Week 2 - Tuesday, May 12
  { date: "2026-05-12", dayOfWeek: "Tuesday", week: 2, court: 1, home: "Viva la Bocce", away: "Donne Vere" },
  { date: "2026-05-12", dayOfWeek: "Tuesday", week: 2, court: 2, home: "Movin' Balls", away: "Cannoli Hope" },
  { date: "2026-05-12", dayOfWeek: "Tuesday", week: 2, court: 3, home: "Roll Models", away: "Bocce Mamas" },
  { date: "2026-05-12", dayOfWeek: "Tuesday", week: 2, court: 4, home: "La Bocce Vita", away: "Limoncello Sorellas" },
  { date: "2026-05-12", dayOfWeek: "Tuesday", week: 2, court: 5, home: "Bocce Babes", away: "Wonder Women" },
  { date: "2026-05-12", dayOfWeek: "Tuesday", week: 2, court: 6, home: "D'Bocceri", away: "Donne Dolce" },

  // Week 2 - Thursday, May 14
  { date: "2026-05-14", dayOfWeek: "Thursday", week: 2, court: 1, home: "Donne Dolce", away: "Bocce Bellas" },
  { date: "2026-05-14", dayOfWeek: "Thursday", week: 2, court: 2, home: "D'Bocceri", away: "Bocce Babes" },
  { date: "2026-05-14", dayOfWeek: "Thursday", week: 2, court: 3, home: "Dolls with Balls", away: "Let's Roll" },
  { date: "2026-05-14", dayOfWeek: "Thursday", week: 2, court: 4, home: "Quattro Amici", away: "Bocce Stars" },
  { date: "2026-05-14", dayOfWeek: "Thursday", week: 2, court: 5, home: "Limoncello Sorellas", away: "Bocce Mamas" },
  { date: "2026-05-14", dayOfWeek: "Thursday", week: 2, court: 6, home: "La Bocce Vita", away: "Wonder Women" },

  // Week 3 - Thursday, May 21
  { date: "2026-05-21", dayOfWeek: "Thursday", week: 3, court: 1, home: "Bocce Mamas", away: "Cannoli Hope" },
  { date: "2026-05-21", dayOfWeek: "Thursday", week: 3, court: 2, home: "Limoncello Sorellas", away: "Dolls with Balls" },
  { date: "2026-05-21", dayOfWeek: "Thursday", week: 3, court: 3, home: "Bocce Stars", away: "Bocce Bellas" },
  { date: "2026-05-21", dayOfWeek: "Thursday", week: 3, court: 4, home: "Movin' Balls", away: "Roll Models" },
  { date: "2026-05-21", dayOfWeek: "Thursday", week: 3, court: 5, home: "Quattro Amici", away: "Let's Roll" },
  { date: "2026-05-21", dayOfWeek: "Thursday", week: 3, court: 6, home: "Wonder Women", away: "Viva la Bocce" },

  // Week 4 - Tuesday, May 26
  { date: "2026-05-26", dayOfWeek: "Tuesday", week: 4, court: 1, home: "D'Bocceri", away: "Roll Models" },
  { date: "2026-05-26", dayOfWeek: "Tuesday", week: 4, court: 2, home: "Donne Vere", away: "Wonder Women" },
  { date: "2026-05-26", dayOfWeek: "Tuesday", week: 4, court: 3, home: "La Bocce Vita", away: "Viva la Bocce" },
  { date: "2026-05-26", dayOfWeek: "Tuesday", week: 4, court: 4, home: "Donne Dolce", away: "Bocce Mamas" },
  { date: "2026-05-26", dayOfWeek: "Tuesday", week: 4, court: 5, home: "Movin' Balls", away: "Bocce Babes" },
  { date: "2026-05-26", dayOfWeek: "Tuesday", week: 4, court: 6, home: "Dolls with Balls", away: "Cannoli Hope" },

  // Week 4 - Thursday, May 28
  { date: "2026-05-28", dayOfWeek: "Thursday", week: 4, court: 1, home: "D'Bocceri", away: "Movin' Balls" },
  { date: "2026-05-28", dayOfWeek: "Thursday", week: 4, court: 2, home: "Donne Dolce", away: "Dolls with Balls" },
  { date: "2026-05-28", dayOfWeek: "Thursday", week: 4, court: 3, home: "Limoncello Sorellas", away: "Quattro Amici" },
  { date: "2026-05-28", dayOfWeek: "Thursday", week: 4, court: 4, home: "Bocce Bellas", away: "Let's Roll" },
  { date: "2026-05-28", dayOfWeek: "Thursday", week: 4, court: 5, home: "Cannoli Hope", away: "Bocce Stars" },
  { date: "2026-05-28", dayOfWeek: "Thursday", week: 4, court: 6, home: "Bocce Babes", away: "Bocce Mamas" },

  // Week 5 - Thursday, June 4
  { date: "2026-06-04", dayOfWeek: "Thursday", week: 5, court: 1, home: "Bocce Stars", away: "Limoncello Sorellas" },
  { date: "2026-06-04", dayOfWeek: "Thursday", week: 5, court: 2, home: "Bocce Bellas", away: "Quattro Amici" },
  { date: "2026-06-04", dayOfWeek: "Thursday", week: 5, court: 3, home: "Movin' Balls", away: "Let's Roll" },
  { date: "2026-06-04", dayOfWeek: "Thursday", week: 5, court: 4, home: "D'Bocceri", away: "Viva la Bocce" },
  { date: "2026-06-04", dayOfWeek: "Thursday", week: 5, court: 5, home: "Roll Models", away: "La Bocce Vita" },
  { date: "2026-06-04", dayOfWeek: "Thursday", week: 5, court: 6, home: "Bocce Mamas", away: "Donne Vere" },

  // Week 6 - Tuesday, June 9
  { date: "2026-06-09", dayOfWeek: "Tuesday", week: 6, court: 1, home: "Wonder Women", away: "Bocce Mamas" },
  { date: "2026-06-09", dayOfWeek: "Tuesday", week: 6, court: 2, home: "Let's Roll", away: "La Bocce Vita" },
  { date: "2026-06-09", dayOfWeek: "Tuesday", week: 6, court: 3, home: "Donne Vere", away: "Bocce Babes" },
  { date: "2026-06-09", dayOfWeek: "Tuesday", week: 6, court: 4, home: "Dolls with Balls", away: "Roll Models" },
  { date: "2026-06-09", dayOfWeek: "Tuesday", week: 6, court: 5, home: "Cannoli Hope", away: "Donne Dolce" },
  { date: "2026-06-09", dayOfWeek: "Tuesday", week: 6, court: 6, home: "Viva la Bocce", away: "Quattro Amici" },

  // Week 6 - Thursday, June 11
  { date: "2026-06-11", dayOfWeek: "Thursday", week: 6, court: 1, home: "La Bocce Vita", away: "Bocce Bellas" },
  { date: "2026-06-11", dayOfWeek: "Thursday", week: 6, court: 2, home: "Limoncello Sorellas", away: "Viva la Bocce" },
  { date: "2026-06-11", dayOfWeek: "Thursday", week: 6, court: 3, home: "Quattro Amici", away: "Roll Models" },
  { date: "2026-06-11", dayOfWeek: "Thursday", week: 6, court: 4, home: "Dolls with Balls", away: "Donne Vere" },
  { date: "2026-06-11", dayOfWeek: "Thursday", week: 6, court: 5, home: "Let's Roll", away: "Donne Dolce" },
  { date: "2026-06-11", dayOfWeek: "Thursday", week: 6, court: 6, home: "Bocce Stars", away: "Movin' Balls" },

  // Week 7 - Thursday, June 18
  { date: "2026-06-18", dayOfWeek: "Thursday", week: 7, court: 1, home: "Limoncello Sorellas", away: "Movin' Balls" },
  { date: "2026-06-18", dayOfWeek: "Thursday", week: 7, court: 2, home: "Donne Dolce", away: "Wonder Women" },
  { date: "2026-06-18", dayOfWeek: "Thursday", week: 7, court: 3, home: "Dolls with Balls", away: "Bocce Stars" },
  { date: "2026-06-18", dayOfWeek: "Thursday", week: 7, court: 4, home: "Cannoli Hope", away: "Donne Vere" },
  { date: "2026-06-18", dayOfWeek: "Thursday", week: 7, court: 5, home: "D'Bocceri", away: "Bocce Bellas" },
  { date: "2026-06-18", dayOfWeek: "Thursday", week: 7, court: 6, home: "Let's Roll", away: "Bocce Babes" },

  // Week 8 - Tuesday, June 23
  { date: "2026-06-23", dayOfWeek: "Tuesday", week: 8, court: 1, home: "Viva la Bocce", away: "Bocce Babes" },
  { date: "2026-06-23", dayOfWeek: "Tuesday", week: 8, court: 2, home: "La Bocce Vita", away: "Bocce Mamas" },
  { date: "2026-06-23", dayOfWeek: "Tuesday", week: 8, court: 3, home: "Cannoli Hope", away: "Let's Roll" },
  { date: "2026-06-23", dayOfWeek: "Tuesday", week: 8, court: 4, home: "Wonder Women", away: "Quattro Amici" },
  { date: "2026-06-23", dayOfWeek: "Tuesday", week: 8, court: 5, home: "Donne Vere", away: "Bocce Stars" },
  { date: "2026-06-23", dayOfWeek: "Tuesday", week: 8, court: 6, home: "Roll Models", away: "Donne Dolce" },

  // Week 8 - Thursday, June 25
  { date: "2026-06-25", dayOfWeek: "Thursday", week: 8, court: 1, home: "Cannoli Hope", away: "Bocce Babes" },
  { date: "2026-06-25", dayOfWeek: "Thursday", week: 8, court: 2, home: "Donne Vere", away: "Bocce Bellas" },
  { date: "2026-06-25", dayOfWeek: "Thursday", week: 8, court: 3, home: "Let's Roll", away: "Roll Models" },
  { date: "2026-06-25", dayOfWeek: "Thursday", week: 8, court: 4, home: "Viva la Bocce", away: "Bocce Stars" },
  { date: "2026-06-25", dayOfWeek: "Thursday", week: 8, court: 5, home: "Movin' Balls", away: "Dolls with Balls" },
  { date: "2026-06-25", dayOfWeek: "Thursday", week: 8, court: 6, home: "D'Bocceri", away: "Limoncello Sorellas" },

  // Week 9 - Tuesday, June 30
  { date: "2026-06-30", dayOfWeek: "Tuesday", week: 9, court: 1, home: "Let's Roll", away: "Limoncello Sorellas" },
  { date: "2026-06-30", dayOfWeek: "Tuesday", week: 9, court: 2, home: "Roll Models", away: "Wonder Women" },
  { date: "2026-06-30", dayOfWeek: "Tuesday", week: 9, court: 3, home: "Donne Dolce", away: "Movin' Balls" },
  { date: "2026-06-30", dayOfWeek: "Tuesday", week: 9, court: 4, home: "Bocce Mamas", away: "Quattro Amici" },
  { date: "2026-06-30", dayOfWeek: "Tuesday", week: 9, court: 5, home: "D'Bocceri", away: "Dolls with Balls" },
  { date: "2026-06-30", dayOfWeek: "Tuesday", week: 9, court: 6, home: "Cannoli Hope", away: "La Bocce Vita" },

  // Week 9 - Thursday, July 2
  { date: "2026-07-02", dayOfWeek: "Thursday", week: 9, court: 1, home: "Donne Vere", away: "La Bocce Vita" },
  { date: "2026-07-02", dayOfWeek: "Thursday", week: 9, court: 2, home: "Bocce Babes", away: "Bocce Stars" },
  { date: "2026-07-02", dayOfWeek: "Thursday", week: 9, court: 3, home: "Bocce Bellas", away: "Viva la Bocce" },
  { date: "2026-07-02", dayOfWeek: "Thursday", week: 9, court: 4, home: "Bocce Mamas", away: "Movin' Balls" },
  { date: "2026-07-02", dayOfWeek: "Thursday", week: 9, court: 5, home: "Quattro Amici", away: "Cannoli Hope" },
  { date: "2026-07-02", dayOfWeek: "Thursday", week: 9, court: 6, home: "Roll Models", away: "Limoncello Sorellas" },

  // Week 10 - Thursday, July 9
  { date: "2026-07-09", dayOfWeek: "Thursday", week: 10, court: 1, home: "Donne Dolce", away: "Viva la Bocce" },
  { date: "2026-07-09", dayOfWeek: "Thursday", week: 10, court: 2, home: "D'Bocceri", away: "Let's Roll" },
  { date: "2026-07-09", dayOfWeek: "Thursday", week: 10, court: 3, home: "Bocce Stars", away: "Wonder Women" },
  { date: "2026-07-09", dayOfWeek: "Thursday", week: 10, court: 4, home: "Bocce Babes", away: "Bocce Bellas" },
  { date: "2026-07-09", dayOfWeek: "Thursday", week: 10, court: 5, home: "Donne Vere", away: "Roll Models" },
  { date: "2026-07-09", dayOfWeek: "Thursday", week: 10, court: 6, home: "Bocce Mamas", away: "Dolls with Balls" },

  // Week 11 - Thursday, July 23
  { date: "2026-07-23", dayOfWeek: "Thursday", week: 11, court: 1, home: "Dolls with Balls", away: "La Bocce Vita" },
  { date: "2026-07-23", dayOfWeek: "Thursday", week: 11, court: 2, home: "Movin' Balls", away: "Quattro Amici" },
  { date: "2026-07-23", dayOfWeek: "Thursday", week: 11, court: 3, home: "Cannoli Hope", away: "Limoncello Sorellas" },
  { date: "2026-07-23", dayOfWeek: "Thursday", week: 11, court: 4, home: "D'Bocceri", away: "Bocce Stars" },
  { date: "2026-07-23", dayOfWeek: "Thursday", week: 11, court: 5, home: "Bocce Mamas", away: "Let's Roll" },
  { date: "2026-07-23", dayOfWeek: "Thursday", week: 11, court: 6, home: "Wonder Women", away: "Bocce Bellas" },

  // Week 12 - Tuesday, July 28
  { date: "2026-07-28", dayOfWeek: "Tuesday", week: 12, court: 1, home: "Let's Roll", away: "Wonder Women" },
  { date: "2026-07-28", dayOfWeek: "Tuesday", week: 12, court: 2, home: "Viva la Bocce", away: "Roll Models" },
  { date: "2026-07-28", dayOfWeek: "Tuesday", week: 12, court: 3, home: "Donne Vere", away: "Donne Dolce" },
  { date: "2026-07-28", dayOfWeek: "Tuesday", week: 12, court: 4, home: "Bocce Stars", away: "La Bocce Vita" },
  { date: "2026-07-28", dayOfWeek: "Tuesday", week: 12, court: 5, home: "D'Bocceri", away: "Bocce Mamas" },
  { date: "2026-07-28", dayOfWeek: "Tuesday", week: 12, court: 6, home: "Quattro Amici", away: "Bocce Babes" },

  // Week 12 - Thursday, July 30
  { date: "2026-07-30", dayOfWeek: "Thursday", week: 12, court: 1, home: "Bocce Stars", away: "Bocce Mamas" },
  { date: "2026-07-30", dayOfWeek: "Thursday", week: 12, court: 2, home: "D'Bocceri", away: "Cannoli Hope" },
  { date: "2026-07-30", dayOfWeek: "Thursday", week: 12, court: 3, home: "Dolls with Balls", away: "Bocce Babes" },
  { date: "2026-07-30", dayOfWeek: "Thursday", week: 12, court: 4, home: "Limoncello Sorellas", away: "Wonder Women" },
  { date: "2026-07-30", dayOfWeek: "Thursday", week: 12, court: 5, home: "Quattro Amici", away: "La Bocce Vita" },
  { date: "2026-07-30", dayOfWeek: "Thursday", week: 12, court: 6, home: "Bocce Bellas", away: "Movin' Balls" },

  // Week 13 - Thursday, August 6
  { date: "2026-08-06", dayOfWeek: "Thursday", week: 13, court: 1, home: "Bocce Bellas", away: "Dolls with Balls" },
  { date: "2026-08-06", dayOfWeek: "Thursday", week: 13, court: 2, home: "Donne Dolce", away: "Limoncello Sorellas" },
  { date: "2026-08-06", dayOfWeek: "Thursday", week: 13, court: 3, home: "La Bocce Vita", away: "Movin' Balls" },
  { date: "2026-08-06", dayOfWeek: "Thursday", week: 13, court: 4, home: "Viva la Bocce", away: "Cannoli Hope" },
  { date: "2026-08-06", dayOfWeek: "Thursday", week: 13, court: 5, home: "Roll Models", away: "Bocce Stars" },
  { date: "2026-08-06", dayOfWeek: "Thursday", week: 13, court: 6, home: "Quattro Amici", away: "Donne Vere" },

  // Week 14 - Tuesday, August 11
  { date: "2026-08-11", dayOfWeek: "Tuesday", week: 14, court: 1, home: "Bocce Babes", away: "Roll Models" },
  { date: "2026-08-11", dayOfWeek: "Tuesday", week: 14, court: 2, home: "Bocce Mamas", away: "Viva la Bocce" },
  { date: "2026-08-11", dayOfWeek: "Tuesday", week: 14, court: 3, home: "D'Bocceri", away: "Quattro Amici" },
  { date: "2026-08-11", dayOfWeek: "Tuesday", week: 14, court: 4, home: "Let's Roll", away: "Donne Vere" },
  { date: "2026-08-11", dayOfWeek: "Tuesday", week: 14, court: 5, home: "Wonder Women", away: "Movin' Balls" },
  { date: "2026-08-11", dayOfWeek: "Tuesday", week: 14, court: 6, home: "Bocce Stars", away: "Donne Dolce" },

  // Week 14 - Thursday, August 13 (Court 1 and Court 4 are OPEN COURT - intentionally absent from CSV)
  { date: "2026-08-13", dayOfWeek: "Thursday", week: 14, court: 2, home: "Bocce Bellas", away: "Cannoli Hope" },
  { date: "2026-08-13", dayOfWeek: "Thursday", week: 14, court: 3, home: "La Bocce Vita", away: "Donne Dolce" },
  { date: "2026-08-13", dayOfWeek: "Thursday", week: 14, court: 5, home: "Viva la Bocce", away: "Dolls with Balls" },
  { date: "2026-08-13", dayOfWeek: "Thursday", week: 14, court: 6, home: "Donne Vere", away: "Limoncello Sorellas" },

  // Week 15 - Thursday, August 20
  { date: "2026-08-20", dayOfWeek: "Thursday", week: 15, court: 1, home: "Cannoli Hope", away: "Roll Models" },
  { date: "2026-08-20", dayOfWeek: "Thursday", week: 15, court: 2, home: "Bocce Bellas", away: "Bocce Mamas" },
  { date: "2026-08-20", dayOfWeek: "Thursday", week: 15, court: 3, home: "Bocce Babes", away: "Limoncello Sorellas" },
  { date: "2026-08-20", dayOfWeek: "Thursday", week: 15, court: 4, home: "Wonder Women", away: "Dolls with Balls" },
  { date: "2026-08-20", dayOfWeek: "Thursday", week: 15, court: 5, home: "Movin' Balls", away: "Donne Vere" },
  { date: "2026-08-20", dayOfWeek: "Thursday", week: 15, court: 6, home: "D'Bocceri", away: "La Bocce Vita" },

  // Week 16 - Tuesday, August 25
  { date: "2026-08-25", dayOfWeek: "Tuesday", week: 16, court: 1, home: "D'Bocceri", away: "Donne Vere" },
  { date: "2026-08-25", dayOfWeek: "Tuesday", week: 16, court: 2, home: "Bocce Babes", away: "La Bocce Vita" },
  { date: "2026-08-25", dayOfWeek: "Tuesday", week: 16, court: 3, home: "Wonder Women", away: "Cannoli Hope" },
  { date: "2026-08-25", dayOfWeek: "Tuesday", week: 16, court: 4, home: "Roll Models", away: "Bocce Bellas" },
  { date: "2026-08-25", dayOfWeek: "Tuesday", week: 16, court: 5, home: "Viva la Bocce", away: "Let's Roll" },
  { date: "2026-08-25", dayOfWeek: "Tuesday", week: 16, court: 6, home: "Quattro Amici", away: "Donne Dolce" }
];

const MONTHS: Record<string, string> = {
  January: "01", February: "02", March: "03", April: "04",
  May: "05", June: "06", July: "07", August: "08",
  September: "09", October: "10", November: "11", December: "12"
};

function isoFromCsvDate(value: string): string {
  // CSV format: "May 7 2026"
  const parts = value.trim().split(/\s+/);
  if (parts.length !== 3) throw new Error(`Unexpected date: ${value}`);
  const [month, day, year] = parts;
  const mm = MONTHS[month];
  if (!mm) throw new Error(`Unknown month: ${month}`);
  return `${year}-${mm}-${day.padStart(2, "0")}`;
}

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === "," && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  values.push(current);
  return values;
}

type CsvMatch = {
  date: string; // ISO
  dayOfWeek: string;
  week: number;
  court: number;
  home: string;
  away: string;
};

function loadCsvSchedule(): CsvMatch[] {
  const text = fs.readFileSync(
    path.join(process.cwd(), "supabase/seeds/Bocce_Schedule_2026.csv"),
    "utf8"
  );
  return text
    .trim()
    .split(/\r?\n/)
    .slice(1)
    .map((line) => {
      const [date, day, week, court, home, away] = parseCsvLine(line);
      return {
        date: isoFromCsvDate(date),
        dayOfWeek: day,
        week: Number(week),
        court: Number(court),
        home,
        away
      };
    });
}

function keyOf(m: { date: string; court: number }): string {
  return `${m.date}#${m.court}`;
}

test("CSV schedule row count matches PDF (excluding open courts)", () => {
  const csv = loadCsvSchedule();
  assert.equal(csv.length, PDF_SCHEDULE.length, "row count mismatch");
});

test("CSV schedule matches the PDF row-by-row (date, week, court, both teams)", () => {
  const csv = loadCsvSchedule();
  const csvByKey = new Map(csv.map((row) => [keyOf(row), row]));

  const mismatches: string[] = [];
  for (const pdf of PDF_SCHEDULE) {
    const csvRow = csvByKey.get(keyOf(pdf));
    if (!csvRow) {
      mismatches.push(`Missing in CSV: ${pdf.date} Court ${pdf.court} (${pdf.home} vs ${pdf.away})`);
      continue;
    }
    if (csvRow.week !== pdf.week) {
      mismatches.push(`Week mismatch ${pdf.date} Court ${pdf.court}: pdf=${pdf.week} csv=${csvRow.week}`);
    }
    if (csvRow.dayOfWeek !== pdf.dayOfWeek) {
      mismatches.push(`Day mismatch ${pdf.date}: pdf=${pdf.dayOfWeek} csv=${csvRow.dayOfWeek}`);
    }
    if (csvRow.home !== pdf.home || csvRow.away !== pdf.away) {
      mismatches.push(
        `Teams mismatch ${pdf.date} Court ${pdf.court}: pdf=${pdf.home} vs ${pdf.away}; csv=${csvRow.home} vs ${csvRow.away}`
      );
    }
  }

  // Also check CSV has no rows that aren't in the PDF.
  const pdfKeys = new Set(PDF_SCHEDULE.map(keyOf));
  for (const row of csv) {
    if (!pdfKeys.has(keyOf(row))) {
      mismatches.push(`Extra in CSV (not in PDF): ${row.date} Court ${row.court} (${row.home} vs ${row.away})`);
    }
  }

  assert.deepEqual(mismatches, [], `Mismatches:\n${mismatches.join("\n")}`);
});

test("PDF schedule has 6 courts per match-day except August 13 (which has 4 + 2 open courts)", () => {
  const courtsByDate = new Map<string, Set<number>>();
  for (const row of PDF_SCHEDULE) {
    const set = courtsByDate.get(row.date) ?? new Set();
    set.add(row.court);
    courtsByDate.set(row.date, set);
  }

  for (const [date, courts] of courtsByDate) {
    if (date === "2026-08-13") {
      assert.equal(courts.size, 4, `Aug 13 should have 4 active courts, got ${courts.size}`);
      assert.ok(!courts.has(1) && !courts.has(4), "Aug 13 courts 1 and 4 should be open");
    } else {
      assert.equal(courts.size, 6, `${date} should have 6 courts, got ${courts.size}`);
    }
  }
});

test("PDF schedule never schedules the same team twice on a given match-day", () => {
  const teamsByDate = new Map<string, Map<string, number>>();
  for (const row of PDF_SCHEDULE) {
    const counts = teamsByDate.get(row.date) ?? new Map<string, number>();
    counts.set(row.home, (counts.get(row.home) ?? 0) + 1);
    counts.set(row.away, (counts.get(row.away) ?? 0) + 1);
    teamsByDate.set(row.date, counts);
  }
  for (const [date, counts] of teamsByDate) {
    for (const [team, count] of counts) {
      assert.ok(count <= 1, `${team} appears ${count}x on ${date}`);
    }
  }
});
