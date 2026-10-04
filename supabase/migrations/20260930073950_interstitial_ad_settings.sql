create table public.interstitial_ad_settings (
  id smallint primary key default 1 check (id = 1),
  enabled boolean not null default false,
  plays_per_ad smallint not null default 5 check (plays_per_ad between 1 and 100)
);

alter table public.interstitial_ad_settings enable row level security;

revoke all on table public.interstitial_ad_settings from public, anon, authenticated;
grant select on table public.interstitial_ad_settings to anon, authenticated;

create policy "App can read interstitial ad settings"
  on public.interstitial_ad_settings
  for select
  to anon, authenticated
  using (id = 1);

insert into public.interstitial_ad_settings (id, enabled, plays_per_ad)
values (1, false, 5);
