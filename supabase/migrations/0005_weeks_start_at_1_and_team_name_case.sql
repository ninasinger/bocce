-- Shift existing weeks so they start at 1 instead of 0.
update matches
set week_number = week_number + 1
where week_number >= 0;

-- Normalize team names to title case.
update teams
set name = initcap(lower(name));
