// Run with a PGlite module path as the first argument; uses an isolated in-memory DB.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const { PGlite } = await import(process.argv[2] || '@electric-sql/pglite')
const db = new PGlite()
const first = '11111111-1111-4111-8111-111111111111'
const second = '22222222-2222-4222-8222-222222222222'
const third = '33333333-3333-4333-8333-333333333333'
await db.exec(`
  create role anon; create role authenticated;
  create schema auth;
  create table auth.users(id uuid primary key);
  create table auth.sessions(id uuid primary key, user_id uuid not null references auth.users(id) on delete cascade);
  create function auth.uid() returns uuid language sql as
    $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  create function auth.jwt() returns jsonb language sql as
    $$ select coalesce(nullif(current_setting('request.jwt.claims', true), '')::jsonb, '{}'::jsonb) $$;
  grant usage on schema auth to authenticated;
  grant execute on function auth.uid() to authenticated;
  grant execute on function auth.jwt() to authenticated;
  create table public.player_events(player_id uuid not null references auth.users(id) on delete cascade, event_name text, level_id smallint);
  alter table public.player_events enable row level security;
  grant insert on public.player_events to authenticated;
  create policy own_events on public.player_events for insert to authenticated
    with check (player_id = auth.uid());
  insert into auth.users values ('${first}'), ('${second}'), ('${third}');
  insert into auth.sessions values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','${first}'),
    ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','${second}'), ('cccccccc-cccc-4ccc-8ccc-cccccccccccc','${third}');
`)
await db.exec(readFileSync(new URL('../../supabase/migrations/20260926140743_anonymous_leaderboard.sql', import.meta.url), 'utf8'))
await db.exec(readFileSync(new URL('../../supabase/migrations/20260927000000_leaderboard_safety_and_deletion.sql', import.meta.url), 'utf8'))
async function asUser(id) {
  await db.exec('reset role')
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [id])
  await db.query("select set_config('request.jwt.claims', $1, false)", [JSON.stringify({ sub: id, is_anonymous: true })])
  await db.exec('set role authenticated')
}
async function asRegisteredUser(id) {
  await db.exec('reset role')
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [id])
  await db.query("select set_config('request.jwt.claims', $1, false)", [JSON.stringify({ sub: id, is_anonymous: false })])
  await db.exec('set role authenticated')
}
async function rpc(sql, args = []) { return (await db.query(sql, args)).rows[0]?.result }
await asUser(first)
assert.equal(await rpc('select public.get_my_leaderboard_profile() as result'), null)
const firstProfile = await rpc('select public.save_leaderboard_profile($1, $2) as result', ['喵喵隊長', 'orange'])
assert.deepEqual({ name: firstProfile.name, avatar: firstProfile.avatar }, { name: '喵喵隊長', avatar: 'orange' })
assert.match(firstProfile.publicId, /^[0-9a-f-]{36}$/)
assert.notEqual(firstProfile.publicId, first)
await assert.rejects(() => db.query('select public.save_leaderboard_profile($1,$2)', ['新名字', 'blue']))
await assert.rejects(() => db.query('select public.save_leaderboard_profile($1,$2)', ['Fuck this', 'orange']))
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
assert.ok(rows.every(r => /^[0-9a-f-]{36}$/.test(r.publicId)))
const secondPublicId = rows.find(r => !r.isMe).publicId
const myPublicId = rows.find(r => r.isMe).publicId
await assert.rejects(() => db.query('select public.block_leaderboard_player($1)', [myPublicId]))
await rpc('select public.block_leaderboard_player($1) as result', [secondPublicId])
assert.equal((await rpc('select public.get_leaderboard() as result')).length, 1)
const blocked = await rpc('select public.get_my_blocked_players() as result')
assert.equal(blocked.length, 1)
assert.equal(blocked[0].name, '喵喵隊長')
assert.ok(!('player_id' in blocked[0]))
await rpc('select public.unblock_leaderboard_player($1) as result', [secondPublicId])
assert.equal((await rpc('select public.get_my_blocked_players() as result')).length, 0)
assert.equal((await rpc('select public.get_leaderboard() as result')).length, 2)
await rpc('select public.leave_leaderboard()')
assert.equal(await rpc('select public.get_my_leaderboard_profile() as result'), null)
assert.equal((await rpc('select public.get_leaderboard() as result')).length, 1)
await asRegisteredUser(third)
await assert.rejects(() => db.query('select public.delete_my_anonymous_account()'))
await asUser(second)
assert.equal(await rpc('select public.delete_my_anonymous_account() as result'), true)
await assert.rejects(() => db.query('select public.get_leaderboard()'))
await assert.rejects(() => db.query('select public.delete_my_anonymous_account()'))
await db.exec('reset role')
assert.equal((await db.query('select id from auth.users where id = $1', [second])).rows.length, 0)
assert.equal((await db.query('select id from auth.sessions where user_id = $1', [second])).rows.length, 0)
assert.equal((await db.query('select player_id from public.player_events where player_id = $1', [second])).rows.length, 0)
assert.equal((await db.query('select player_id from leaderboard_private.clears where player_id = $1', [second])).rows.length, 0)
await asUser(first)
assert.equal((await rpc('select public.get_leaderboard() as result')).length, 1)
assert.equal((await rpc('select public.get_my_leaderboard_profile() as result')).name, '喵喵隊長')
await db.exec('reset role; set role anon')
await assert.rejects(() => db.query('select public.get_leaderboard()'))
await asUser('')
await assert.rejects(() => db.query('select public.get_leaderboard()'))
await db.close()
console.log('PASS: profile ownership, name moderation, cooldown, distinct clears, ties, opaque IDs, block/unblock, account deletion and authorization')
