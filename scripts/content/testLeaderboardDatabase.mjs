// Run with a PGlite module path as the first argument; uses an isolated in-memory DB.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const { PGlite } = await import(process.argv[2] || '@electric-sql/pglite')
const db = new PGlite()
const first = '11111111-1111-4111-8111-111111111111'
const second = '22222222-2222-4222-8222-222222222222'
await db.exec(`
  create role anon; create role authenticated;
  create schema auth;
  create table auth.users(id uuid primary key);
  create function auth.uid() returns uuid language sql as
    $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  grant usage on schema auth to authenticated;
  grant execute on function auth.uid() to authenticated;
  create table public.player_events(player_id uuid, event_name text, level_id smallint);
  alter table public.player_events enable row level security;
  grant insert on public.player_events to authenticated;
  create policy own_events on public.player_events for insert to authenticated
    with check (player_id = auth.uid());
  insert into auth.users values ('${first}'), ('${second}');
`)
await db.exec(readFileSync(new URL('../../supabase/migrations/20260926140743_anonymous_leaderboard.sql', import.meta.url), 'utf8'))
async function asUser(id) {
  await db.exec('reset role')
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [id])
  await db.exec('set role authenticated')
}
async function rpc(sql, args = []) { return (await db.query(sql, args)).rows[0]?.result }
await asUser(first)
assert.equal(await rpc('select public.get_my_leaderboard_profile() as result'), null)
assert.deepEqual(await rpc('select public.save_leaderboard_profile($1, $2) as result', ['喵喵隊長', 'orange']), { name: '喵喵隊長', avatar: 'orange' })
await assert.rejects(() => db.query('select public.save_leaderboard_profile($1,$2)', ['新名字', 'blue']))
await db.query('insert into player_events values ($1,$2,1),($1,$2,1),($1,$2,2)', [first, 'level_completed'])
await assert.rejects(() => db.query('insert into player_events values ($1,$2,3)', [second, 'level_completed']))
await assert.rejects(() => db.query('select * from leaderboard_private.profiles'))
await assert.rejects(() => db.query('insert into leaderboard_private.clears values ($1,90)', [first]))
await asUser(second)
await assert.rejects(() => db.query('select public.save_leaderboard_profile($1,$2)', ['<script>', 'orange']))
await assert.rejects(() => db.query('select public.save_leaderboard_profile($1,$2)', ['小白', 'evil-url']))
await rpc('select public.save_leaderboard_profile($1,$2) as result', ['小白', 'white'])
await db.query('insert into player_events values ($1,$2,1),($1,$2,2)', [second, 'level_completed'])
const rows = await rpc('select public.get_leaderboard() as result')
assert.equal(rows.length, 2)
assert.deepEqual(rows.map(r => r.rank), [1, 1])
assert.deepEqual(rows.map(r => r.completed), [2, 2])
assert.equal(rows.filter(r => r.isMe).length, 1)
assert.ok(rows.every(r => !('player_id' in r)))
await db.query('select public.leave_leaderboard()')
assert.equal((await rpc('select public.get_leaderboard() as result')).length, 1)
assert.equal(await rpc('select public.get_my_leaderboard_profile() as result'), null)
await db.exec('reset role; set role anon')
await assert.rejects(() => db.query('select public.get_leaderboard()'))
await asUser('')
await assert.rejects(() => db.query('select public.get_leaderboard()'))
await db.close()
console.log('PASS: profile ownership, input validation, cooldown, distinct clears, ties, private IDs, opt-out and anonymous-role denial')
