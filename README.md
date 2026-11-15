# Nobre · Sistema de gestão de barbearia

Sistema administrativo para barbearias com agenda, clientes, profissionais, financeiro sem caixa, comissões, estoque, vendas, relatórios e automações. Este repositório está na **Fase 1 (Fundação)**, com autenticação, permissões e base do banco integradas.

## Stack

- React 19 + Vite + TypeScript
- Tailwind CSS 4 + componentes no padrão shadcn/ui (Radix)
- React Router, TanStack Query, Zustand, React Hook Form + Zod
- Supabase (PostgreSQL, Auth, RLS, Edge Functions)
- Vitest + React Testing Library

## Requisitos

- Node.js 20+ (testado com Node 24)
- npm 10+
- Projeto Supabase (cloud ou local com Docker)
- Supabase CLI (`npx supabase`)

## Configuração

1. Crie o arquivo de ambiente:

```bash
cp .env.example .env
```

Preencha:

| Variável | Descrição |
| --- | --- |
| `VITE_SUPABASE_URL` | URL do projeto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Chave pública `anon` / publishable |
| `VITE_APP_URL` | URL pública da aplicação (links de e-mail) |

Use **somente** a chave pública no frontend. A `service_role` é usada apenas pela Edge Function.

2. Conecte o projeto e aplique as migrations:

```bash
npx supabase login
npx supabase link --project-ref SEU_PROJECT_REF
npx supabase db push
```

As migrations criam tabelas, funções, triggers, RLS e a matriz de permissões.

> Projeto já vinculado neste repositório: `jygwofqqieburbukbegm` (região us-west-1). As duas migrations da Fase 1 já foram aplicadas, a função `team-invite` está publicada com o secret `APP_URL` e o Auth aponta para `http://localhost:5173` (confirmação de e-mail desativada em desenvolvimento — habilite em produção).

3. Configure o Auth no painel do Supabase:

- **Site URL:** `http://localhost:5173` (ou domínio de produção)
- **Redirect URLs:** `http://localhost:5173/**`, `.../auth/redefinir-senha`, `.../onboarding`
- **Mínimo de senha:** 8 caracteres, letras e números
- Habilite confirmação de e-mail em produção (o cadastro trata os dois cenários)

4. Publique a função de convite:

```bash
npx supabase secrets set APP_URL=https://seu-dominio.com
npx supabase functions deploy team-invite
```

5. Rode a aplicação:

```bash
npm install
npm run dev
```

No primeiro acesso, crie a conta e conclua o onboarding: nome da barbearia, identificador, seu nome e telefone. Isso cria o estabelecimento e o primeiro administrador.

## Scripts

| Script | Descrição |
| --- | --- |
| `npm run dev` | Ambiente de desenvolvimento |
| `npm run build` | Typecheck + build de produção |
| `npm run preview` | Pré-visualização do build |
| `npm run typecheck` | Verificação TypeScript |
| `npm test` | Testes unitários (Vitest) |
| `npm run test:db` | Valida migrations, RLS e triggers em PostgreSQL (PGlite) |
| `npm run test:watch` | Testes em modo watch |
| `npm run lint` | Oxlint |

## Estrutura

```
src/
  components/
    layout/        Sidebar, topbar e shell responsivo
    shared/        Componentes de apoio (campos, estados, logo)
    ui/            Design system (Radix + Tailwind)
  hooks/           Auth, contexto do usuário e permissões
  lib/             Supabase, erros, formatação, utils
  modules/
    auth/          Login, cadastro, recuperação, onboarding
    account/       Conta e segurança
    dashboard/     Painel inicial
    team/          Equipe, convites e papéis
    settings/      Dados do estabelecimento
  providers/       QueryClient, Auth e Toaster
  routes/          Router, guards por sessão e permissão
  schemas/         Validações Zod
  stores/          Estado de UI (Zustand)
  types/           Tipos do banco e da aplicação
supabase/
  migrations/      Schema, RBAC, RLS e auditoria
  functions/       team-invite (Edge Function)
  seed.sql
tests e2e serão adicionados nas fases seguintes.
```

## Segurança e isolamento

- Toda tabela usa `establishment_id` e RLS.
- Funções auxiliares (`current_establishment_id`, `has_permission`, `my_context`) são `SECURITY DEFINER` com `search_path` fixo, evitando recursão de políticas.
- Perfis: **Administrador**, **Gerente**, **Recepcionista** e **Barbeiro**, com permissões granulares em `role_permissions`.
- Administrador tem acesso total; os demais seguem a matriz da migration de permissões.
- Alteração de papel/status exige `users.manage` e é validada por trigger no banco.
- O último administrador ativo não pode ser rebaixado ou desativado.
- Auditoria automática em `profiles` e `establishments`; consulta restrita a `audit.view`.
- `service_role` nunca é exposta no frontend.

## Fase 1 — entregue

- Projeto configurado, tema grafite/dourado, layout recolhível e responsivo.
- Banco: establishments, profiles, permissions, role_permissions, audit_logs.
- Login, cadastro, recuperação/redefinição de senha e onboarding.
- Guards de sessão, permissão e acesso inativo.
- Dashboard com dados reais da equipe e progresso de configuração.
- Equipe: convite por e-mail, troca de papel, ativação/desativação.
- Configurações do estabelecimento e conta (perfil, senha, sessões).
- Testes unitários e build validados.

## Limitações conhecidas desta fase

- O convite depende da função `team-invite` publicada e do segredo `APP_URL`.
- Cada usuário pertence a um único estabelecimento nesta versão.
- A agenda, financeiro e demais módulos entram nas fases 2–7.
- Sem Docker, use o Supabase cloud; o CLI local exige Docker.

## Próxima fase

Fase 2 — cadastros de clientes, barbeiros, serviços e categorias, com integração total ao banco e às permissões.
