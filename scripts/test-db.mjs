// ============================================================================
// Verificação das migrations da Fase 1 em PostgreSQL real (PGlite).
// Simula as extensões do Supabase (auth.uid, roles) e exercita RLS/triggers.
// Uso: node scripts/test-db.mjs
// ============================================================================

import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { PGlite } from '@electric-sql/pglite'

const root = path.resolve(import.meta.dirname, '..')
const migrationsDir = path.join(root, 'supabase', 'migrations')

let passed = 0
const failures = []

function assert(condition, message) {
  if (condition) {
    passed += 1
    console.log(`  ✓ ${message}`)
    return
  }
  failures.push(message)
  console.error(`  ✗ ${message}`)
}

async function expectError(promise, pattern, message) {
  try {
    await promise
    failures.push(`${message} (nenhum erro foi lançado)`)
    console.error(`  ✗ ${message} (nenhum erro foi lançado)`)
  } catch (error) {
    const text = String(error?.message ?? error)
    assert(pattern.test(text), message)
  }
}

const db = new PGlite()

async function asPostgres() {
  await db.exec('reset role')
}

async function actAs(userId, role = 'authenticated') {
  await db.exec('reset role')
  await db.query(
    "select set_config('request.jwt.claim.sub', $1, false), set_config('request.jwt.claim.role', $2, false)",
    [userId, role],
  )
  await db.exec(`set role ${role}`)
}

console.log('Preparando ambiente Supabase simulado...')

await db.exec(`
  create schema auth;
  create table auth.users (
    id uuid primary key,
    email text,
    raw_user_meta_data jsonb not null default '{}'::jsonb
  );

  create or replace function auth.uid()
  returns uuid language sql stable as $$
    select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
  $$;

  create or replace function auth.role()
  returns text language sql stable as $$
    select nullif(current_setting('request.jwt.claim.role', true), '')
  $$;

  create schema if not exists extensions;

  do $$
  begin
    if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin; end if;
    if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin; end if;
    if not exists (select 1 from pg_roles where rolname = 'service_role') then create role service_role nologin; end if;
  end
  $$;

  grant usage on schema auth to authenticated;
  grant execute on function auth.uid() to authenticated;
  grant execute on function auth.role() to authenticated;
`)

const files = (await readdir(migrationsDir)).filter((file) => file.endsWith('.sql')).sort()

for (const file of files) {
  console.log(`Aplicando ${file}...`)
  let sql = await readFile(path.join(migrationsDir, file), 'utf8')
  // pgcrypto não é necessário: gen_random_uuid() é nativo no PG 17.
  sql = sql.replace(/create extension if not exists pgcrypto with schema extensions;/i, '')
  await db.exec(sql)
}

await db.exec(`
  grant usage on schema public to authenticated;
  grant select, insert, update, delete on all tables in schema public to authenticated;
  grant usage, select on all sequences in schema public to authenticated;
`)

console.log('\nCenários de integração, RLS e permissões:')

const adminA = '11111111-1111-4111-8111-111111111111'
const memberA = '22222222-2222-4222-8222-222222222222'
const adminB = '33333333-3333-4333-8333-333333333333'
const outsider = '44444444-4444-4444-8444-444444444444'

await db.query(
  `insert into auth.users (id, email) values
     ($1, 'admin@a.com'),
     ($2, 'membro@a.com'),
     ($3, 'admin@b.com'),
     ($4, 'sem-perfil@a.com')`,
  [adminA, memberA, adminB, outsider],
)

await actAs(adminA)
const bootstrap = await db.query(
  "select public.bootstrap_establishment('Barbearia A', 'barbearia-a', 'Admin A', '(11) 99999-0000') as ctx",
)
const ctxA = bootstrap.rows[0].ctx
assert(ctxA.profile.role === 'admin', 'bootstrap cria o primeiro usuário como administrador')
assert(ctxA.establishment.slug === 'barbearia-a', 'bootstrap cria o estabelecimento com slug normalizado')
assert(ctxA.permissions.length >= 25, 'administrador recebe a matriz completa de permissões')
assert(ctxA.profile.full_name === 'Admin A', 'bootstrap usa o nome informado')

await actAs(outsider)
await expectError(
  db.query("select public.bootstrap_establishment('Outra', 'barbearia-a', 'Outro', null)"),
  /identificador|slug|uso/i,
  'bootstrap impede identificador duplicado',
)

const emptyContext = await db.query('select public.my_context() as ctx')
assert(emptyContext.rows[0].ctx === null, 'usuário sem perfil não recebe contexto')

await asPostgres()
const establishmentAId = ctxA.establishment.id
await db.query(
  `insert into public.profiles (id, establishment_id, full_name, email, phone, role, status)
   values ($1, $2, 'Membro A', 'membro@a.com', null, 'barbeiro', 'ativo')`,
  [memberA, establishmentAId],
)

const establishmentB = await db.query(
  `insert into public.establishments (name, slug) values ('Barbearia B', 'barbearia-b') returning id`,
)
await db.query(
  `insert into public.profiles (id, establishment_id, full_name, email, role, status)
   values ($1, $2, 'Admin B', 'admin@b.com', 'admin', 'ativo')`,
  [adminB, establishmentB.rows[0].id],
)

await actAs(memberA)
const memberProfiles = await db.query('select id from public.profiles')
assert(memberProfiles.rows.length === 2, 'RLS: membro vê apenas perfis do próprio estabelecimento')

const memberEstablishments = await db.query('select id from public.establishments')
assert(
  memberEstablishments.rows.length === 1 && memberEstablishments.rows[0].id === establishmentAId,
  'RLS: membro vê apenas o próprio estabelecimento',
)

const memberAudit = await db.query('select id from public.audit_logs')
assert(memberAudit.rows.length === 0, 'RLS: barbeiro não acessa auditoria')

await actAs(memberA)
await expectError(
  db.query("update public.profiles set role = 'admin' where id = $1", [memberA]),
  /permiss/i,
  'trigger impede auto-promoção de perfil',
)

await actAs(adminA)
await db.query("update public.profiles set role = 'gerente' where id = $1", [memberA])

await actAs(memberA)
const memberContext = await db.query('select public.my_context() as ctx')
assert(memberContext.rows[0].ctx.profile.role === 'gerente', 'administrador altera papel de outro membro')
assert(
  memberContext.rows[0].ctx.permissions.includes('users.view') &&
    !memberContext.rows[0].ctx.permissions.includes('users.manage'),
  'gerente recebe as permissões corretas',
)

const escalation = await db.query(
  "update public.profiles set role = 'recepcionista' where id = $1",
  [adminA],
)
assert(escalation.affectedRows === 0, 'RLS: gerente não altera o papel de um administrador')

await asPostgres()
const adminStillAdmin = await db.query('select role from public.profiles where id = $1', [adminA])
assert(adminStillAdmin.rows[0].role === 'admin', 'papel do administrador permanece inalterado')

await actAs(adminA)

await expectError(
  db.query("update public.profiles set status = 'inativo' where id = $1", [adminA]),
  /próprio|proprio|administrador ativo/i,
  'administrador não desativa o próprio acesso',
)

await expectError(
  db.query("update public.profiles set role = 'gerente' where id = $1", [adminA]),
  /administrador ativo/i,
  'último administrador ativo não pode ser rebaixado',
)

await actAs(adminA)
const auditUpdate = await db.query("update public.audit_logs set action = 'adulterado'")
assert(auditUpdate.affectedRows === 0, 'RLS: auditoria não pode ser alterada')

const adminAudit = await db.query('select action from public.audit_logs')
assert(adminAudit.rows.length > 0, 'auditoria registra operações e é visível ao administrador')

await db.query("update public.profiles set status = 'inativo' where id = $1", [memberA])
await actAs(memberA)
const blocked = await db.query('select id from public.profiles')
assert(blocked.rows.length === 0, 'RLS: membro inativo perde acesso aos dados')

const inactiveContext = await db.query('select public.my_context() as ctx')
assert(inactiveContext.rows[0].ctx.profile.status === 'inativo', 'contexto reflete o status inativo')
assert(inactiveContext.rows[0].ctx.permissions.length === 0, 'membro inativo não recebe permissões')

console.log(`\n${passed} verificações aprovadas, ${failures.length} falhas.`)

if (failures.length > 0) {
  process.exitCode = 1
}

await db.close()
