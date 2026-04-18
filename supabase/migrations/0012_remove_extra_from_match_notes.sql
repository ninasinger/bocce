-- Remove legacy "- EXTRA" suffix from court notes in the 2026 schedule.
update matches
set notes = regexp_replace(notes, '\s*-\s*EXTRA\b', '', 'gi')
where notes ~* '\s*-\s*EXTRA\b';
