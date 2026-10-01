# Majolica Redesign and John Pirelli Lodge Bocce Name

## Goal

Restyle the site with an Amalfi Coast "Majolica" theme (cobalt and lemon
hand-painted tiles on white stucco) and rename it from Bella Villa Bocce
League to John Pirelli Lodge Bocce everywhere a visitor sees the name. The
domain stays bellavillabocce.com.

## Palette and type

Tailwind color tokens are renamed so names match what they look like.
Every class using an old name is migrated; no old names remain.

| Old token | New token | Value     | Role                          |
|-----------|-----------|-----------|-------------------------------|
| `moss`    | `cobalt`  | `#1E4E9C` | primary: tabs, links, ranks   |
| `sun`     | `lemon`   | `#F2C230` | accent: card edge, court chip |
| `field`   | `stucco`  | `#FBF8F1` | page background               |
| `stone`   | `slate`   | `#56688A` | secondary text                |
| `ink`     | `ink`     | `#14284B` | body text                     |
| `clay`    | (removed) |           | unused                        |
| (new)     | `leaf`    | `#4C7A34` | tile corners, small accents   |
| (new)     | `tile`    | `#DCE3EF` | hairline borders              |

- Display font: Cormorant Garamond (italic for titles); body font:
  Source Sans 3. Both via `next/font/google`.
- Body background becomes flat stucco (radial gradients removed).
- Cards: white, 1px `tile` border, 12px radius, subtle shadow.

## Components

- `MajolicaBand` (new, `src/components/MajolicaBand.tsx`): inline SVG
  pattern strip — cobalt diamond, white inset, lemon center, leaf
  corners. Used in the header and the off-season banner.
- Header (`layout.tsx`): tile band, then "John Pirelli Lodge Bocce" in
  cobalt italic Cormorant. No league-specific subtitle.
- `SessionIndicator`: renders nothing when not signed in.
- `LeagueTabs`: selected = solid cobalt, unselected = white with
  cobalt outline; 8px radius.
- Schedule match card: 4px lemon top edge with square corners, lemon
  court chip, status badge, then a score table (`MatchScoreTable`, new
  component) with columns G1 / G2 / Tot. Winner row bold, loser slate.
  Matches without per-game scores show only Tot; unplayed matches show
  just the two team names. The "Final: … | Games: …" and "Winner: …"
  lines are removed. Ties show both rows in regular weight.
- Standings, Docs, team page, loading/empty/error states inherit the
  tokens; headings use the italic display font, ranks are cobalt.
- `teamStyle.ts`: team initial circles use Majolica tints (cobalt,
  lemon, leaf, sky, terracotta, slate) instead of the rainbow set.
- `StatusBadge`: Final = leaf tint, Scheduled = cobalt tint; warning
  and error states keep amber/red.
- Desktop and bottom nav: active state cobalt.

## Name and icon

- `metadata.title` and the off-season banner: "John Pirelli Lodge Bocce".
- `appleWebApp.title` and manifest `short_name`: "Pirelli Bocce"
  (home-screen labels truncate past ~12 characters); manifest `name`:
  "John Pirelli Lodge Bocce". `themeColor` cobalt, manifest background stucco.
- `public/icon-192.svg`, `public/icon-512.svg`, `src/app/icon.svg`:
  cobalt majolica tile with a lemon-and-white bocce ball.

## PDFs

- `schedulePdf.ts`: `THEME` switches to Majolica colors; the header
  draws a tile strip built from squares (the PDF writer only supports
  rects, lines and text).
- Title is per league: `John Pirelli Lodge Bocce - <season name>` with a
  plain hyphen, since the PDF writer emits raw text in Helvetica and a
  `·` would print as garbage (replaces
  the hard-coded "John Pirelli Womens Bocce League 2026", which
  mislabeled Co-ed Fall downloads). PDF tests change first.

## Testing

- Update PDF title tests (fail first), then `npm test`, `npm run build`.
- Grep confirms no `moss|sun|field|stone|clay` color classes remain.
- Browser check of Schedule, Standings, Docs and a team page at phone
  and desktop widths; download and view a PDF; view the icon.
- Before/after screenshots shared before deploying.
