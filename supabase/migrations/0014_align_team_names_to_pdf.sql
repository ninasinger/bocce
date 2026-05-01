-- Align 2026 team names to the canonical PDF spelling.
-- PDF: "Donne Dolce", "Bocce Mamas", "Movin' Balls",
--      "Dolls with Balls", "Viva la Bocce".

do $$
declare
  v_season_id uuid;
begin
  select id into v_season_id from seasons where year = 2026 order by created_at desc limit 1;
  if v_season_id is null then
    raise notice 'No 2026 season found; skipping team name alignment.';
    return;
  end if;

  update teams set name = 'Donne Dolce'
    where season_id = v_season_id and name = 'Donne Dolci';

  update teams set name = 'Bocce Mamas'
    where season_id = v_season_id and name = 'Bocce Mammas';

  update teams set name = 'Movin'' Balls'
    where season_id = v_season_id and name in ('Movin Balls', 'Movin'' Balls');

  update teams set name = 'Dolls with Balls'
    where season_id = v_season_id and name = 'Dolls With Balls';

  update teams set name = 'Viva la Bocce'
    where season_id = v_season_id and name = 'Viva La Bocce';
end $$;
