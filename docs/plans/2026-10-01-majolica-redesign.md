# Majolica Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the site with the Amalfi "Majolica" theme and rename it John Pirelli Lodge Bocce everywhere a visitor sees the name.

**Architecture:** Rename the Tailwind color tokens to Majolica names and sweep every class in `src/` to them, so all pages (including the hidden captain/commissioner pages) restyle at once. Public pages then get targeted component work: a tile band header, restyled league tabs and nav, and a tested score-table helper behind a new match card. PDFs and icons follow the same palette.

**Tech Stack:** Next.js 14 app router, Tailwind 3, `next/font/google`, hand-rolled PDF writer (`src/lib/simplePdf.ts`), `node --test` via `tsc -p tsconfig.test.json`.

**Spec:** `docs/plans/2026-10-01-majolica-redesign-design.md`

## Global Constraints

- Palette: cobalt `#1E4E9C`, lemon `#F2C230`, stucco `#FBF8F1`, slate `#56688A`, ink `#14284B`, leaf `#4C7A34`, tile `#DCE3EF`.
- Display font Cormorant Garamond (italic titles); body Source Sans 3.
- Site name "John Pirelli Lodge Bocce"; home-screen label "Pirelli Bocce"; domain unchanged.
- PDF titles use a plain hyphen: `John Pirelli Lodge Bocce - <season name>`.
- No `moss|sun|field|stone|clay` color classes remain in `src/`.
- Bump `CACHE_NAME` in `public/sw.js` (v7 → v8).

---

### Task 1: Palette tokens, fonts, global styles

**Files:**
- Modify: `tailwind.config.ts`, `src/app/globals.css`, `src/app/layout.tsx` (fonts only), every `src/**/*.tsx|ts|css` using old tokens

Note: the current `fontFamily` entries name `"Fraunces"`/`"Work Sans"` literally, but `next/font` exposes hashed family names through CSS variables, so those fonts were never applied. Point Tailwind at the variables.

- [ ] **Step 1: Replace the Tailwind theme**

```ts
colors: {
  ink: "#14284B",
  cobalt: { DEFAULT: "#1E4E9C", deep: "#163B77" },
  lemon: { DEFAULT: "#F2C230", deep: "#6B5200" },
  leaf: { DEFAULT: "#4C7A34", deep: "#2F4F1F" },
  terracotta: { DEFAULT: "#C4623A", deep: "#7A3315" },
  stucco: "#FBF8F1",
  slate: "#56688A",
  tile: "#DCE3EF"
},
fontFamily: {
  display: ["var(--font-display)", "serif"],
  body: ["var(--font-body)", "sans-serif"]
},
boxShadow: {
  soft: "0 6px 20px rgba(20, 40, 75, 0.06)"
}
```

- [ ] **Step 2: Sweep old token names in class strings**

```bash
perl -pi -e 'my %m=(moss=>"cobalt",sun=>"lemon",field=>"stucco",stone=>"slate"); s/\b((?:bg|text|border|ring|ring-offset|decoration|divide|outline|fill|stroke|placeholder|accent|caret)-)(moss|sun|field|stone)\b/$1.$m{$2}/ge' $(grep -rlE '(moss|sun|field|stone)' src --include=*.tsx --include=*.ts --include=*.css)
perl -pi -e 's/\bborder-white\/(60|70)\b/border-tile/g; s/\bdivide-white\/60\b/divide-tile/g; s/\bbg-white\/70\b/bg-stucco/g' $(grep -rlE 'white/(60|70)' src)
```

- [ ] **Step 3: Verify no old tokens remain**

Run: `grep -rnE '\b(bg|text|border|ring|ring-offset|decoration|divide)-(moss|sun|field|stone|clay)\b' src`
Expected: no output. (`schedulePdf.ts` THEME keys are JS, handled in Task 5.)

- [ ] **Step 4: Global styles** — in `globals.css`: body `@apply bg-stucco text-ink font-body;` with the radial-gradient `background-image` removed; `.card` → `bg-white rounded-2xl shadow-soft border border-tile`; `.section-title` → `font-display text-3xl font-bold italic tracking-tight text-cobalt`; `.nav-pill-muted` → `bg-white text-ink border border-tile hover:border-cobalt/40`; `.nav-pill-active` → `bg-cobalt text-white shadow-sm`; focus ring `ring-cobalt/40 ring-offset-stucco`; `.sticky-filters` keeps `bg-white/95`; mobile `.site-header h1` → `text-3xl`. Add:

```css
.match-card {
  @apply border border-tile border-t-4 border-t-lemon bg-white p-3;
}
```

- [ ] **Step 5: Fonts in `layout.tsx`**

```ts
import { Cormorant_Garamond, Source_Sans_3 } from "next/font/google";
const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display"
});
const body = Source_Sans_3({ subsets: ["latin"], variable: "--font-body" });
```

- [ ] **Step 6:** `npm run build` — expect success. Commit "Switch to Majolica palette and fonts".

### Task 2: Tile band header, name, session pill

**Files:**
- Create: `src/components/MajolicaBand.tsx`
- Modify: `src/app/layout.tsx`, `src/components/SessionIndicator.tsx`, `public/manifest.json`

**Interfaces:** Produces `MajolicaBand({ className?: string })`.

- [ ] **Step 1: `MajolicaBand`** (constant pattern id; duplicate identical defs are harmless)

```tsx
export function MajolicaBand({ className = "" }: { className?: string }) {
  return (
    <svg className={`block h-6 w-full ${className}`} aria-hidden="true" focusable="false">
      <defs>
        <pattern id="majolica-tile" width="24" height="24" patternUnits="userSpaceOnUse">
          <rect width="24" height="24" fill="#FFFFFF" />
          <path d="M12 2 L22 12 L12 22 L2 12 Z" fill="#1E4E9C" />
          <path d="M12 7 L17 12 L12 17 L7 12 Z" fill="#FFFFFF" />
          <circle cx="12" cy="12" r="2.5" fill="#F2C230" />
          <circle cx="0" cy="0" r="3.5" fill="#4C7A34" />
          <circle cx="24" cy="0" r="3.5" fill="#4C7A34" />
          <circle cx="0" cy="24" r="3.5" fill="#4C7A34" />
          <circle cx="24" cy="24" r="3.5" fill="#4C7A34" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#majolica-tile)" />
    </svg>
  );
}
```

- [ ] **Step 2: Layout** — metadata `title: "John Pirelli Lodge Bocce"`, `description: "Schedules and standings for John Pirelli Lodge Bocce"`, `appleWebApp.title: "Pirelli Bocce"`, `themeColor: "#1E4E9C"`. Render `<MajolicaBand />` as the first child of `<body>` in both branches. Header: drop the "Bocce League" badge; `<h1 className="font-display text-4xl font-bold italic text-cobalt md:text-5xl">John Pirelli Lodge Bocce</h1>`. Off-season card: title "John Pirelli Lodge Bocce" (same h1 style) above "See you next season!".
- [ ] **Step 3: Session pill** — `SessionIndicator` returns `null` while `variant === "neutral"`; commissioner class `bg-cobalt text-white`.
- [ ] **Step 4: Manifest** — `name: "John Pirelli Lodge Bocce"`, `short_name: "Pirelli Bocce"`, `description: "Schedules and standings for John Pirelli Lodge Bocce"`, `background_color: "#FBF8F1"`, `theme_color: "#1E4E9C"`.
- [ ] **Step 5:** `npm run build`; commit "Add tile band header and John Pirelli Lodge Bocce name".

### Task 3: League tabs and nav

**Files:** Modify `src/components/LeagueTabs.tsx`, `src/components/BottomNav.tsx`

- [ ] **Step 1: LeagueTabs** — container `flex min-h-[2.75rem] gap-1.5` (no frame); button `tap min-w-0 flex-1 basis-0 rounded-lg border px-2 py-2 text-sm font-semibold leading-tight md:text-base` plus active `border-cobalt bg-cobalt text-white shadow-sm` / inactive `border-cobalt/30 bg-white text-cobalt hover:border-cobalt`.
- [ ] **Step 2: BottomNav** — bar `border-t border-tile bg-white/95`; active `text-cobalt` with icon chip `bg-cobalt/10`; inactive `text-slate`.
- [ ] **Step 3:** build; commit "Restyle league tabs and navigation".

### Task 4: Score table and match card

**Files:**
- Create: `src/lib/scoreTable.ts`, `src/components/MatchScoreTable.tsx`, `tests/scoreTable.test.ts`
- Modify: `src/app/schedule/page.tsx`, `tsconfig.test.json` (include `src/lib/scoreTable.ts`)

**Interfaces:**
- Produces `buildScoreTable(match: ScoreTableMatch): ScoreTable` and `MatchScoreTable({ match, home, away })` where `home`/`away` are `React.ReactNode`.

```ts
export type ScoreTableMatch = {
  status: string;
  home_total_score: number | null;
  away_total_score: number | null;
  game1_home_score?: number | null;
  game1_away_score?: number | null;
  game2_home_score?: number | null;
  game2_away_score?: number | null;
};
export type SideResult = "win" | "loss" | "tie" | null;
export type ScoreSide = { games: number[]; total: number | null; result: SideResult };
export type ScoreTable = { showScores: boolean; showGames: boolean; home: ScoreSide; away: ScoreSide };
```

- [ ] **Step 1: Failing tests** (`tests/scoreTable.test.ts`)

```ts
import test from "node:test";
import assert from "node:assert/strict";
import { buildScoreTable } from "../src/lib/scoreTable";

const unplayed = { status: "scheduled", home_total_score: null, away_total_score: null };

test("an unplayed match shows no scores", () => {
  const table = buildScoreTable(unplayed);
  assert.equal(table.showScores, false);
  assert.equal(table.showGames, false);
  assert.equal(table.home.result, null);
});

test("a finished match with per-game scores shows games and totals", () => {
  const table = buildScoreTable({
    status: "verified", home_total_score: 29, away_total_score: 12,
    game1_home_score: 14, game1_away_score: 6, game2_home_score: 15, game2_away_score: 6
  });
  assert.equal(table.showGames, true);
  assert.deepEqual(table.home, { games: [14, 15], total: 29, result: "win" });
  assert.deepEqual(table.away, { games: [6, 6], total: 12, result: "loss" });
});

test("a finished match without per-game scores shows totals only", () => {
  const table = buildScoreTable({ status: "corrected", home_total_score: 20, away_total_score: 28 });
  assert.equal(table.showScores, true);
  assert.equal(table.showGames, false);
  assert.deepEqual(table.home, { games: [], total: 20, result: "loss" });
  assert.equal(table.away.result, "win");
});

test("equal totals mark both sides as a tie", () => {
  const table = buildScoreTable({ status: "verified", home_total_score: 25, away_total_score: 25 });
  assert.equal(table.home.result, "tie");
  assert.equal(table.away.result, "tie");
});

test("totals on a match that is not final are not shown", () => {
  const table = buildScoreTable({ status: "pending_verification", home_total_score: 29, away_total_score: 12 });
  assert.equal(table.showScores, false);
});
```

- [ ] **Step 2:** stub `buildScoreTable` returning all-false/null; `npm test` → these fail.
- [ ] **Step 3: Implement**

```ts
const FINAL_STATUSES = new Set(["verified", "corrected"]);

function result(own: number, other: number): SideResult {
  if (own === other) return "tie";
  return own > other ? "win" : "loss";
}

export function buildScoreTable(match: ScoreTableMatch): ScoreTable {
  const home = match.home_total_score;
  const away = match.away_total_score;
  if (!FINAL_STATUSES.has(match.status) || home == null || away == null) {
    const empty: ScoreSide = { games: [], total: null, result: null };
    return { showScores: false, showGames: false, home: empty, away: { ...empty } };
  }
  const homeGames = [match.game1_home_score, match.game2_home_score];
  const awayGames = [match.game1_away_score, match.game2_away_score];
  const showGames = [...homeGames, ...awayGames].every((score) => score != null);
  return {
    showScores: true,
    showGames,
    home: { games: showGames ? (homeGames as number[]) : [], total: home, result: result(home, away) },
    away: { games: showGames ? (awayGames as number[]) : [], total: away, result: result(away, home) }
  };
}
```

- [ ] **Step 4:** `npm test` → all pass.
- [ ] **Step 5: `MatchScoreTable`** — grid columns `grid-cols-[minmax(0,1fr)_1.75rem_1.75rem_2.75rem]` with games, `grid-cols-[minmax(0,1fr)_2.75rem]` totals only, `grid-cols-1` unplayed. Header row `G1 G2 Tot` (text-xs text-slate) only when `showGames`. Team cell: win `font-bold text-ink`, loss `text-slate`, otherwise `font-semibold text-ink`. Game cells `text-center tabular-nums`, slate on the losing row. Total `text-right font-display text-2xl font-bold leading-none tabular-nums`, `text-cobalt` unless loss (`text-slate/60`).
- [ ] **Step 6: Schedule card** — replace the card body with: header row (lemon court chip `bg-lemon/30 text-lemon-deep`, date `text-slate`, `StatusBadge` pushed right with `ml-auto`), then `<MatchScoreTable match={item} home={teamLink(item.home_team)} away={teamLink(item.away_team)} />` inside `mt-3`. Card class `match-card`. Delete `winnerText` and `gameScoresText`. Day group headings `text-cobalt`.
- [ ] **Step 7:** build; commit "Show matches as a score table".

### Task 5: Standings, docs, team page, badges, team colors, PDFs

**Files:** Modify `src/app/standings/page.tsx`, `src/components/StatusBadge.tsx`, `src/lib/teamStyle.ts`, `src/lib/schedulePdf.ts`, `tests/schedulePdf.test.ts`

- [ ] **Step 1: PDF tests first** — in `tests/schedulePdf.test.ts` build with `"Co-ed Fall 2026"` and assert `pdf.includes("John Pirelli Lodge Bocce - Co-ed Fall 2026")` and `!pdf.includes("Womens")` in both the full-league and team tests. Run `npm test` → both fail.
- [ ] **Step 2: PDF implementation** — export `leagueTitle(seasonName) => \`John Pirelli Lodge Bocce - ${seasonName}\``; use it in both builders (replacing `LEAGUE_TITLE`); THEME → stucco page, white card, tile border, cobalt, cobaltSoft `#E2E9F4`, lemon, ink, slate; `drawPageChrome` draws a 27-tile strip at y=36 (each tile: 20×20 cobalt, 12×12 white inset at +4, 6×6 lemon at +7) instead of the badge; header box gets a lemon top strip, cobalt title, slate subtitle; table header cobaltSoft fill with cobalt text. Run `npm test` → pass.
- [ ] **Step 3: Standings** — rank chip `bg-cobalt/10 text-cobalt`; mobile "Games Won" number `font-display text-2xl font-bold text-cobalt`; desktop thead `bg-stucco text-slate`, tbody `bg-white divide-tile`, rank cell `font-bold text-cobalt`.
- [ ] **Step 4: StatusBadge** — `verified: "bg-leaf/15 text-leaf-deep"`, `scheduled: "bg-cobalt/10 text-cobalt"`, `partial_score: "bg-cobalt/10 text-cobalt"`; others unchanged.
- [ ] **Step 5: Team colors** — `TEAM_COLORS = ["bg-cobalt/15 text-cobalt-deep", "bg-lemon/40 text-lemon-deep", "bg-leaf/20 text-leaf-deep", "bg-sky-100 text-sky-900", "bg-terracotta/20 text-terracotta-deep", "bg-slate/20 text-ink"]`.
- [ ] **Step 6:** build; commit "Restyle standings, badges, team colors and PDFs".

### Task 6: App icon and cache bump

**Files:** Modify `public/icon-192.svg`, `public/icon-512.svg`, `src/app/icon.svg`, `public/sw.js`

- [ ] **Step 1:** One 192-unit design (scaled via `viewBox="0 0 192 192"`; 512 file sets `width/height="512"`): cobalt rounded square `rx=42`, clipped leaf quarter-circles at the corners, stucco diamond `M96 16 L176 96 L96 176 L16 96 Z` with a cobalt inner outline, and a lemon bocce ball `circle r=34` with cobalt stroke and two white seam curves. `src/app/icon.svg` uses the same art.
- [ ] **Step 2:** `CACHE_NAME = "bocce-v8"`. Commit "New majolica app icon".

### Task 7: Verification

- [ ] `npm test`, `npm run build`, old-token grep (Task 1 Step 3) all clean.
- [ ] Unregister the preview tab's service worker, then check Schedule, Standings, Docs and a team page at mobile and desktop; switch league tabs; download the Co-ed Fall PDF and confirm the title; view `/icon-192.svg`.
- [ ] Before screenshots (live site) and after screenshots (local) shared with the user before deploying.
