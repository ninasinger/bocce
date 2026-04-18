-- Remove duplicated trailing "(year)" from season names, e.g. "Bocce League 2026 (2026)".
update seasons
set name = trim(regexp_replace(name, '\\s*\\(' || year::text || '\\)\\s*$', ''))
where name ~ ('\\(' || year::text || '\\)\\s*$');
