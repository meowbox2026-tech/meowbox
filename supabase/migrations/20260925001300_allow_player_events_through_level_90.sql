alter table public.player_events
  drop constraint if exists player_events_level_id_check;

alter table public.player_events
  add constraint player_events_level_id_check check (level_id between 1 and 90);
