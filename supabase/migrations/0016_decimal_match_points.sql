alter table matches
  alter column home_match_points type numeric(4, 1) using home_match_points::numeric(4, 1),
  alter column away_match_points type numeric(4, 1) using away_match_points::numeric(4, 1);
