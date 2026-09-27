alter table leaderboard_private.profiles
  add column public_id uuid not null default gen_random_uuid() unique;

create or replace function leaderboard_private.name_is_allowed(p_name text) returns boolean
language sql immutable set search_path = '' as $$
  select p_name is not null
    and char_length(btrim(p_name)) between 2 and 16
    and btrim(p_name) !~ '[^[:alnum:] _-]'
    and lower(btrim(p_name)) !~ '(^|[^[:alnum:]])(fuck|fucking|shit|bitch|asshole|bastard|dickhead|slut|whore)($|[^[:alnum:]])'
    and btrim(p_name) !~ '(操你|幹你|干你|他媽|他妈|媽的|妈的|婊子|賤人|贱人)';
$$;
revoke all on function leaderboard_private.name_is_allowed(text) from public, anon, authenticated;
grant execute on function leaderboard_private.name_is_allowed(text) to authenticated;

alter table leaderboard_private.profiles
  add constraint profiles_name_moderation_check
  check (leaderboard_private.name_is_allowed(name)) not valid;

create function leaderboard_private.require_active_identity() returns uuid
language plpgsql security definer set search_path = '' as $$
declare player_id uuid := auth.uid();
begin
  if player_id is null or not exists(select 1 from auth.users where id = player_id) then
    raise exception 'active account required' using errcode = '42501';
  end if;
  return player_id;
end;
$$;
revoke all on function leaderboard_private.require_active_identity() from public, anon, authenticated;
grant execute on function leaderboard_private.require_active_identity() to authenticated;

create table leaderboard_private.blocked_players (
  blocker_id uuid not null references auth.users(id) on delete cascade,
  target_public_id uuid not null references leaderboard_private.profiles(public_id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, target_public_id)
);
alter table leaderboard_private.blocked_players enable row level security;
revoke all on leaderboard_private.blocked_players from public, anon, authenticated;

create or replace function leaderboard_private.profile_read() returns jsonb
language plpgsql security definer set search_path = '' as $$
begin
  perform leaderboard_private.require_active_identity();
  return (select jsonb_build_object('publicId', public_id, 'name', name, 'avatar', avatar)
    from leaderboard_private.profiles where player_id = auth.uid());
end;
$$;

create or replace function leaderboard_private.profile_save(p_name text, p_avatar text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare last_update timestamptz;
begin
  perform leaderboard_private.require_active_identity();
  if not leaderboard_private.name_is_allowed(p_name) then
    raise exception 'name not allowed' using errcode = '22023';
  end if;
  if p_avatar not in ('arrogant','sunny','fishLover','orange','white','blue',
    'alone','sleeping','box','mischievous','boss','sticky') then
    raise exception 'avatar not allowed' using errcode = '22023';
  end if;
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

create or replace function leaderboard_private.profile_leave() returns void
language plpgsql security definer set search_path = '' as $$
begin
  perform leaderboard_private.require_active_identity();
  delete from leaderboard_private.profiles where player_id = auth.uid();
end;
$$;

create or replace function leaderboard_private.ranking_read() returns jsonb
language plpgsql security definer set search_path = '' as $$
begin
  perform leaderboard_private.require_active_identity();
  return (
    with scores as (
      select p.player_id, p.public_id, p.name, p.avatar, count(c.level_id)::integer as completed
      from leaderboard_private.profiles p
      left join leaderboard_private.clears c using(player_id)
      where leaderboard_private.name_is_allowed(p.name)
      group by p.player_id
    ), ranked as (
      select *, rank() over(order by completed desc) as position from scores
    ), visible as (
      select r.*, row_number() over(order by completed desc, public_id) as ordinal
      from ranked r
      where r.player_id = auth.uid() or not exists (
        select 1 from leaderboard_private.blocked_players b
        where b.blocker_id = auth.uid() and b.target_public_id = r.public_id
      )
    )
    select coalesce(jsonb_agg(jsonb_build_object('publicId', public_id, 'name', name,
      'avatar', avatar, 'completed', completed, 'rank', position, 'isMe', player_id = auth.uid())
      order by ordinal), '[]'::jsonb)
    from visible where ordinal <= 100 or player_id = auth.uid()
  );
end;
$$;

create or replace function leaderboard_private.block_player(p_public_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare own_public_id uuid;
begin
  perform leaderboard_private.require_active_identity();
  select public_id into own_public_id from leaderboard_private.profiles where player_id = auth.uid();
  if p_public_id is null or p_public_id = own_public_id then
    raise exception 'cannot block this player' using errcode = '22023';
  end if;
  if not exists(select 1 from leaderboard_private.profiles where public_id = p_public_id) then
    raise exception 'player not found' using errcode = '22023';
  end if;
  insert into leaderboard_private.blocked_players(blocker_id, target_public_id)
    values(auth.uid(), p_public_id) on conflict do nothing;
end;
$$;

create or replace function leaderboard_private.unblock_player(p_public_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  perform leaderboard_private.require_active_identity();
  delete from leaderboard_private.blocked_players
    where blocker_id = auth.uid() and target_public_id = p_public_id;
end;
$$;

create or replace function leaderboard_private.blocked_players_read() returns jsonb
language plpgsql security definer set search_path = '' as $$
begin
  perform leaderboard_private.require_active_identity();
  return coalesce((
    select jsonb_agg(jsonb_build_object('publicId', p.public_id, 'name', p.name, 'avatar', p.avatar)
      order by b.created_at desc)
    from leaderboard_private.blocked_players b
    join leaderboard_private.profiles p on p.public_id = b.target_public_id
    where b.blocker_id = auth.uid()
  ), '[]'::jsonb);
end;
$$;

create or replace function leaderboard_private.delete_anonymous_account() returns boolean
language plpgsql security definer set search_path = '' as $$
declare deleted boolean;
begin
  perform leaderboard_private.require_active_identity();
  if coalesce(auth.jwt()->>'is_anonymous', 'false') <> 'true' then
    raise exception 'anonymous account required' using errcode = '42501';
  end if;
  delete from auth.sessions where user_id = auth.uid();
  delete from auth.users where id = auth.uid();
  deleted := found;
  return deleted;
end;
$$;

revoke all on function leaderboard_private.profile_read(), leaderboard_private.profile_save(text,text),
  leaderboard_private.ranking_read(), leaderboard_private.block_player(uuid),
  leaderboard_private.unblock_player(uuid), leaderboard_private.blocked_players_read(),
  leaderboard_private.delete_anonymous_account(), leaderboard_private.profile_leave()
  from public, anon, authenticated;
grant execute on function leaderboard_private.profile_read(), leaderboard_private.profile_save(text,text),
  leaderboard_private.ranking_read(), leaderboard_private.block_player(uuid),
  leaderboard_private.unblock_player(uuid), leaderboard_private.blocked_players_read(),
  leaderboard_private.delete_anonymous_account(), leaderboard_private.profile_leave()
  to authenticated;

create or replace function public.get_my_leaderboard_profile() returns jsonb
language sql security invoker set search_path = '' as $$ select leaderboard_private.profile_read(); $$;
create or replace function public.save_leaderboard_profile(p_name text, p_avatar text) returns jsonb
language sql security invoker set search_path = '' as $$ select leaderboard_private.profile_save(p_name, p_avatar); $$;
create or replace function public.get_leaderboard() returns jsonb
language sql security invoker set search_path = '' as $$ select leaderboard_private.ranking_read(); $$;
create or replace function public.leave_leaderboard() returns void
language sql security invoker set search_path = '' as $$ select leaderboard_private.profile_leave(); $$;
create function public.block_leaderboard_player(p_public_id uuid) returns void
language sql security invoker set search_path = '' as $$ select leaderboard_private.block_player(p_public_id); $$;
create function public.unblock_leaderboard_player(p_public_id uuid) returns void
language sql security invoker set search_path = '' as $$ select leaderboard_private.unblock_player(p_public_id); $$;
create function public.get_my_blocked_players() returns jsonb
language sql security invoker set search_path = '' as $$ select leaderboard_private.blocked_players_read(); $$;
create function public.delete_my_anonymous_account() returns boolean
language sql security invoker set search_path = '' as $$ select leaderboard_private.delete_anonymous_account(); $$;

revoke all on function public.get_my_leaderboard_profile(), public.save_leaderboard_profile(text,text),
  public.get_leaderboard(), public.block_leaderboard_player(uuid),
  public.unblock_leaderboard_player(uuid), public.get_my_blocked_players(),
  public.delete_my_anonymous_account() from public, anon, authenticated;
grant execute on function public.get_my_leaderboard_profile(), public.save_leaderboard_profile(text,text),
  public.get_leaderboard(), public.block_leaderboard_player(uuid),
  public.unblock_leaderboard_player(uuid), public.get_my_blocked_players(),
  public.delete_my_anonymous_account() to authenticated;
