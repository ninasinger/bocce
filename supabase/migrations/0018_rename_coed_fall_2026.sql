-- Rename the fall league from "Fall Co-ed 2026" to "Co-ed Fall 2026".
update seasons
set name = 'Co-ed Fall 2026'
where name = 'Fall Co-ed 2026' and year = 2026;
