create extension if not exists pgcrypto;

create table if not exists public.player_events (
  event_id uuid primary key default gen_random_uuid(),
  player_id uuid not null references auth.users (id) on delete cascade,
  session_id uuid not null,
  event_name text not null check (event_name in (
    'session_started',
    'level_started',
    'level_completed',
    'level_failed',
    'hint_used',
    'session_ended'
  )),
  level_id smallint check (level_id between 1 and 30),
  attempt_id uuid,
  clear_time_ms integer check (clear_time_ms between 0 and 86400000),
  stars_earned smallint check (stars_earned between 1 and 3),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists player_events_created_at_idx
  on public.player_events (created_at desc);

create index if not exists player_events_level_event_idx
  on public.player_events (level_id, event_name, created_at desc);

alter table public.player_events enable row level security;

revoke all on table public.player_events from anon, authenticated;
grant insert on table public.player_events to authenticated;

drop policy if exists "anonymous players can insert their own events" on public.player_events;
create policy "anonymous players can insert their own events"
  on public.player_events
  for insert
  to authenticated
  with check (
    player_id = (select auth.uid())
    and coalesce((select (auth.jwt() ->> 'is_anonymous')::boolean), false)
  );

create or replace function public.get_player_status_metrics(
  p_from timestamptz,
  p_to timestamptz
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  result jsonb;
begin
  if p_from is null or p_to is null or p_from >= p_to or p_to - p_from > interval '366 days' then
    raise exception 'invalid analytics range' using errcode = '22023';
  end if;

  with filtered_events as (
    select *
    from public.player_events
    where created_at >= p_from
      and created_at < p_to
  ), summary as (
    select
      count(*)::integer as events,
      count(distinct player_id)::integer as active_players,
      count(distinct session_id)::integer as sessions,
      count(distinct attempt_id) filter (where event_name = 'level_started')::integer as attempts,
      count(distinct attempt_id) filter (where event_name = 'level_completed')::integer as completed_attempts,
      count(*) filter (where event_name = 'level_failed')::integer as failures,
      count(*) filter (where event_name = 'hint_used')::integer as hints,
      round(avg(clear_time_ms) filter (where event_name = 'level_completed'))::integer as average_clear_time_ms,
      percentile_cont(0.5) within group (order by clear_time_ms)
        filter (where event_name = 'level_completed')::integer as median_clear_time_ms,
      round(avg(stars_earned) filter (where event_name = 'level_completed'), 2) as average_stars
    from filtered_events
  ), levels as (
    select
      level_id,
      count(distinct attempt_id) filter (where event_name = 'level_started')::integer as attempts,
      count(distinct attempt_id) filter (where event_name = 'level_completed')::integer as completed_attempts,
      count(*) filter (where event_name = 'level_failed')::integer as failures,
      count(*) filter (where event_name = 'hint_used')::integer as hints,
      round(avg(clear_time_ms) filter (where event_name = 'level_completed'))::integer as average_clear_time_ms,
      percentile_cont(0.5) within group (order by clear_time_ms)
        filter (where event_name = 'level_completed')::integer as median_clear_time_ms,
      round(avg(stars_earned) filter (where event_name = 'level_completed'), 2) as average_stars
    from filtered_events
    where level_id is not null
    group by level_id
  )
  select jsonb_build_object(
    'source', 'public.player_events',
    'from', p_from,
    'to', p_to,
    'sample', jsonb_build_object(
      'events', summary.events,
      'active_players', summary.active_players,
      'sessions', summary.sessions,
      'attempts', summary.attempts,
      'completed_attempts', summary.completed_attempts,
      'failures', summary.failures,
      'hints', summary.hints,
      'average_clear_time_ms', summary.average_clear_time_ms,
      'median_clear_time_ms', summary.median_clear_time_ms,
      'average_stars', summary.average_stars
    ),
    'levels', coalesce(
      (
        select jsonb_agg(jsonb_build_object(
          'level_id', levels.level_id,
          'attempts', levels.attempts,
          'completed_attempts', levels.completed_attempts,
          'failures', levels.failures,
          'hints', levels.hints,
          'average_clear_time_ms', levels.average_clear_time_ms,
          'median_clear_time_ms', levels.median_clear_time_ms,
          'average_stars', levels.average_stars
        ) order by levels.level_id)
        from levels
      ),
      '[]'::jsonb
    )
  )
  into result
  from summary;

  return result;
end;
$$;

comment on function public.get_player_status_metrics(timestamptz, timestamptz)
  is 'Returns aggregate player-status metrics only; raw player events remain protected by RLS.';

revoke all on function public.get_player_status_metrics(timestamptz, timestamptz) from public;
grant execute on function public.get_player_status_metrics(timestamptz, timestamptz) to anon, authenticated;
