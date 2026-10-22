-- Aggregate player metrics are business data, not app functionality. The
-- publishable key ships in every client, so anon/authenticated must not be able
-- to call this SECURITY DEFINER report. Read it from the Supabase SQL editor.
revoke all on function public.get_player_status_metrics(timestamptz, timestamptz)
  from public, anon, authenticated;
grant execute on function public.get_player_status_metrics(timestamptz, timestamptz)
  to service_role;

comment on function public.get_player_status_metrics(timestamptz, timestamptz)
  is 'Returns aggregate player-status metrics only; restricted to service_role and the SQL editor.';
