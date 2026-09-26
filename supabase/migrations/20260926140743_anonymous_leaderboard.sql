-- Public API exposes only nicknames, built-in avatars, rank and distinct clears.
-- Existing client-reported analytics are NOT a cryptographic proof of gameplay.
create schema if not exists leaderboard_private;
revoke all on schema leaderboard_private from public, anon, authenticated;
grant usage on schema leaderboard_private to authenticated;

create table leaderboard_private.profiles (
  player_id uuid primary key references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 16 and name = btrim(name)
    and name !~ '[^[:alnum:] _-]'),
  avatar text not null check (avatar in ('arrogant','sunny','fishLover','orange','white','blue',
    'alone','sleeping','box','mischievous','boss','sticky')),
  updated_at timestamptz not null default now()
);
create table leaderboard_private.clears (
  player_id uuid not null references auth.users(id) on delete cascade,
  level_id smallint not null check (level_id between 1 and 90),
  primary key (player_id, level_id)
);
alter table leaderboard_private.profiles enable row level security;
alter table leaderboard_private.clears enable row level security;
revoke all on leaderboard_private.profiles, leaderboard_private.clears from public, anon, authenticated;

-- Trigger is privileged so the analytics writer never gains direct score-table access.
create function leaderboard_private.capture_clear() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.player_id is distinct from auth.uid() then
    raise exception 'authentication required' using errcode = '42501';
  end if;
  if new.event_name = 'level_completed' and new.level_id between 1 and 90 then
    insert into leaderboard_private.clears(player_id, level_id)
      values(new.player_id, new.level_id) on conflict do nothing;
  end if;
  return new;
end;
$$;
revoke all on function leaderboard_private.capture_clear() from public, anon, authenticated;
create trigger leaderboard_capture_clear after insert on public.player_events
  for each row execute function leaderboard_private.capture_clear();

insert into leaderboard_private.clears(player_id, level_id)
  select distinct player_id, level_id from public.player_events
  where event_name = 'level_completed' and level_id between 1 and 90
  on conflict do nothing;

create function leaderboard_private.profile_read() returns jsonb
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'authentication required' using errcode = '42501'; end if;
  return (select jsonb_build_object('name', name, 'avatar', avatar)
    from leaderboard_private.profiles where player_id = auth.uid());
end;
$$;

create function leaderboard_private.profile_save(p_name text, p_avatar text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare last_update timestamptz;
begin
  if auth.uid() is null then raise exception 'authentication required' using errcode = '42501'; end if;
  -- Serialize edits per identity so concurrent calls cannot bypass cooldown.
  perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text, 0));
  select updated_at into last_update from leaderboard_private.profiles where player_id = auth.uid();
  if last_update > now() - interval '10 seconds' then
    raise exception 'please wait before editing again' using errcode = '22023';
  end if;
  insert into leaderboard_private.profiles(player_id, name, avatar)
    values(auth.uid(), btrim(p_name), p_avatar)
    on conflict(player_id) do update set name = excluded.name, avatar = excluded.avatar, updated_at = now();
  return leaderboard_private.profile_read();
end;
$$;

create function leaderboard_private.profile_leave() returns void
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'authentication required' using errcode = '42501'; end if;
  delete from leaderboard_private.profiles where player_id = auth.uid();
end;
$$;

create function leaderboard_private.ranking_read() returns jsonb
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'authentication required' using errcode = '42501'; end if;
  return (
    with scores as (
      select p.player_id, p.name, p.avatar, count(c.level_id)::integer as completed
      from leaderboard_private.profiles p
      left join leaderboard_private.clears c using(player_id)
      group by p.player_id
    ), ranked as (
      select *, rank() over(order by completed desc) as position,
        row_number() over(order by completed desc, player_id) as ordinal from scores
    )
    select coalesce(jsonb_agg(jsonb_build_object('name', name, 'avatar', avatar,
      'completed', completed, 'rank', position, 'isMe', player_id = auth.uid()) order by ordinal), '[]'::jsonb)
    from ranked where ordinal <= 100 or player_id = auth.uid()
  );
end;
$$;

revoke all on function leaderboard_private.profile_read(), leaderboard_private.profile_save(text,text),
  leaderboard_private.profile_leave(), leaderboard_private.ranking_read() from public, anon, authenticated;
grant execute on function leaderboard_private.profile_read(), leaderboard_private.profile_save(text,text),
  leaderboard_private.profile_leave(), leaderboard_private.ranking_read() to authenticated;

-- Exposed wrappers are SECURITY INVOKER; only narrow private functions hold privileges.
create function public.get_my_leaderboard_profile() returns jsonb
language sql security invoker set search_path = '' as $$ select leaderboard_private.profile_read(); $$;
create function public.save_leaderboard_profile(p_name text, p_avatar text) returns jsonb
language sql security invoker set search_path = '' as $$ select leaderboard_private.profile_save(p_name, p_avatar); $$;
create function public.leave_leaderboard() returns void
language sql security invoker set search_path = '' as $$ select leaderboard_private.profile_leave(); $$;
create function public.get_leaderboard() returns jsonb
language sql security invoker set search_path = '' as $$ select leaderboard_private.ranking_read(); $$;
revoke all on function public.get_my_leaderboard_profile(), public.save_leaderboard_profile(text,text),
  public.leave_leaderboard(), public.get_leaderboard() from public, anon, authenticated;
grant execute on function public.get_my_leaderboard_profile(), public.save_leaderboard_profile(text,text),
  public.leave_leaderboard(), public.get_leaderboard() to authenticated;
