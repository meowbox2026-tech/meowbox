-- Rank players by the highest completed level, not by the number of completed levels.
-- The clears table remains distinct per player and level so repeated clears cannot
-- inflate the highest-level score.
create or replace function leaderboard_private.ranking_read() returns jsonb
language plpgsql security definer set search_path = '' as $$
begin
  perform leaderboard_private.require_active_identity();
  return (
    with scores as (
      select p.player_id, p.public_id, p.name, p.avatar,
        coalesce(max(c.level_id), 0)::integer as highest_level
      from leaderboard_private.profiles p
      left join leaderboard_private.clears c using(player_id)
      where leaderboard_private.name_is_allowed(p.name)
      group by p.player_id
    ), ranked as (
      select *, rank() over(order by highest_level desc) as position from scores
    ), visible as (
      select r.*, row_number() over(order by highest_level desc, public_id) as ordinal
      from ranked r
      where r.player_id = auth.uid() or not exists (
        select 1 from leaderboard_private.blocked_players b
        where b.blocker_id = auth.uid() and b.target_public_id = r.public_id
      )
    )
    select coalesce(jsonb_agg(jsonb_build_object('publicId', public_id, 'name', name,
      'avatar', avatar, 'highestLevel', highest_level, 'rank', position, 'isMe', player_id = auth.uid())
      order by ordinal), '[]'::jsonb)
    from visible where ordinal <= 100 or player_id = auth.uid()
  );
end;
$$;
