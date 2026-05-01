-- Add captain_email and assign each 2026 team its real PIN.
-- PINs are hashed with bcryptjs (10-round salt) so they match what
-- src/lib/auth.ts hashCode() produces.

alter table teams add column if not exists captain_email text;

do $$
declare
  v_season_id uuid;
begin
  select id into v_season_id from seasons where year = 2026 order by created_at desc limit 1;
  if v_season_id is null then
    raise notice 'No 2026 season found; skipping team PIN/email update.';
    return;
  end if;

  update teams set
    captain_name = 'Janet Zak',
    captain_email = 'jzak1211@gmail.com',
    team_code_hash = '$2a$10$yPKdkJEu4L8g4YXi6yFZZee5ym4AKTBllW4Lj5ASfIlRRVavDTc02'
  where season_id = v_season_id and name = 'Bocce Babes';

  update teams set
    captain_name = 'Gloria Marano',
    captain_email = 'gmarano66@gmail.com',
    team_code_hash = '$2a$10$Ab6voXe13QvnhG45Ha2w/.1oqkNHsgBMpCqjan8E4SFQBK/DuOQdu'
  where season_id = v_season_id and name = 'Bocce Bellas';

  update teams set
    captain_name = 'Jan Holbrook',
    captain_email = 'janholbrook75@gmail.com',
    team_code_hash = '$2a$10$16fI6ax72Egtnqsl1Ty9PeOpKVVN5SKFPp0nEjHn2NToNeVZIleYO'
  where season_id = v_season_id and name = 'Bocce Mammas';

  update teams set
    captain_name = 'Michelle Sullivan',
    captain_email = 'mjsullivan288@gmail.com',
    team_code_hash = '$2a$10$O6xf7Q9z7q.ejU380QlD/.yqgGy9KuB4k9zqFDoSRrHovs3krDz/W'
  where season_id = v_season_id and name = 'Bocce Stars';

  update teams set
    captain_name = 'JB Richard',
    captain_email = 'rspjbr@gmail.com',
    team_code_hash = '$2a$10$7xC5Ktf9Fita455Au5xeiuxxtu8OUq1TNW2ywZrF8X4QjNSB7oDKu'
  where season_id = v_season_id and name = 'Cannoli Hope';

  update teams set
    captain_name = 'Caitlin Davis',
    captain_email = 'caitlin.smith1310@gmail.com',
    team_code_hash = '$2a$10$MefAlI9Nh7QU6CHVUpqu7.PE0c.Vxjf5CXWeFJs/CNAh2ptkB8vZK'
  where season_id = v_season_id and name = 'D''Bocceri';

  update teams set
    captain_name = 'Nancy Pietrantonio',
    captain_email = 'nancypietrantonio@gmail.com',
    team_code_hash = '$2a$10$5W5KnsKpvvSeiP7yMFYA0.GvIEdPV06V/pUsjD80VeTJ4KvBQAt4S'
  where season_id = v_season_id and name = 'Dolls With Balls';

  update teams set
    captain_name = 'Mimi Villani',
    captain_email = 'mimidotcom@aol.com',
    team_code_hash = '$2a$10$ce6FCRWT9RPdOwQ6H/N3NeOAkPcWqN7j5Dlw1IVOFsRICzNPqapOm'
  where season_id = v_season_id and name = 'Donne Dolci';

  update teams set
    captain_name = 'Barbara Morris',
    captain_email = 'bam702@yahoo.com',
    team_code_hash = '$2a$10$x0AXS3obRpMvAuBHz2EtIuk4yB69H8qAj1nuLjZa2q6YKFy1.Ld/K'
  where season_id = v_season_id and name = 'Donne Vere';

  update teams set
    captain_name = 'Chuck Levin',
    captain_email = 'charlene.levin@yahoo.com',
    team_code_hash = '$2a$10$6fOjyQGQpl12TMenKRpuqeYnAqVX9r1G4XXvXWtDhflvhtPATrlr.'
  where season_id = v_season_id and name = 'La Bocce Vita';

  update teams set
    captain_name = 'Belinda Ferrara',
    captain_email = 'fbpferrara@aol.com',
    team_code_hash = '$2a$10$cDxQQKR7vgaEU.1tv8vncO.Of6AoTI7NgYzlBCit/SjS9QIub3ueq'
  where season_id = v_season_id and name = 'Limoncello Sorellas';

  update teams set
    captain_name = 'Cathy Colosimo',
    captain_email = 'jabio_dew@yahoo.com',
    team_code_hash = '$2a$10$KqlJFbzALEfTC3yiV9QNjeGza5ijJZKJB/wV4A2b8e66dkmuJeIby'
  where season_id = v_season_id and name = 'Movin'' Balls';

  update teams set
    captain_name = 'Anne Lombardo',
    captain_email = 'annelombardo11@gmail.com',
    team_code_hash = '$2a$10$qfTT3/9POHWPqb/JH.Uhj.AHQyDBJntDASFlIa.ynCgYYTiBLBk1m'
  where season_id = v_season_id and name = 'Roll Models';

  update teams set
    captain_name = 'Kris Russo',
    captain_email = 'jrusso4424@att.net',
    team_code_hash = '$2a$10$ZzjqJNlyZJ63KVMXXcsoQeEM7FiNKYiz.7hJp7v1fY95VHG.sX5W6'
  where season_id = v_season_id and name = 'Quattro Amici';

  update teams set
    captain_name = 'Crystal Frasca',
    captain_email = 'frascacg@gmail.com',
    team_code_hash = '$2a$10$ZGMkiHW1NMu2MjlIGdwhiutj7hfRsTY5DwfRaEtLc.41dqlXVWCle'
  where season_id = v_season_id and name = 'Viva La Bocce';

  update teams set
    captain_name = 'Kay Trombino',
    captain_email = 'ktrombino@aol.com',
    team_code_hash = '$2a$10$.GlKhgyQNZkw0vwFvl45PO6V.AkWbCDKOR/T04kfCbHoxjlWvEDym'
  where season_id = v_season_id and name = 'Wonder Women';

  update teams set
    captain_name = 'Jennifer Petrella',
    captain_email = 'jplilitalian@gmail.com',
    team_code_hash = '$2a$10$b2YJvvzRUYCzvOe0vd7QrOfnW9NV.c7Pvudv4A4tDXwy8LEKuISJW'
  where season_id = v_season_id and name = 'Let''s Roll';
end $$;
