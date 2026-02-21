-- Fix title-cased possessives introduced by initcap (e.g. Bella'S -> Bella's).
update teams
set name = replace(name, '''S', '''s')
where name like '%''S%';
