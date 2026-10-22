-- Levels unlock one at a time, so a clear only reaches the leaderboard when the
-- previous level is already cleared. This stops a single forged level-90 event
-- from topping the board; a script that forges every level in order still works.
-- Skipped clears stay as analytics events without raising: a raised error would
-- leave the event stuck in the client's retry queue. Existing clears are kept,
-- because some real players have gaps from events lost before this change.
create or replace function leaderboard_private.capture_clear() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.player_id is distinct from auth.uid() then
    raise exception 'authentication required' using errcode = '42501';
  end if;
  if new.event_name = 'level_completed' and new.level_id between 1 and 90
    and (new.level_id = 1 or exists(
      select 1 from leaderboard_private.clears
      where player_id = new.player_id and level_id = new.level_id - 1
    )) then
    insert into leaderboard_private.clears(player_id, level_id)
      values(new.player_id, new.level_id) on conflict do nothing;
  end if;
  return new;
end;
$$;
revoke all on function leaderboard_private.capture_clear() from public, anon, authenticated;
