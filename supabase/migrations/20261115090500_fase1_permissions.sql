-- ============================================================================
-- Nobre · Fase 1 — Matriz de permissões
-- ============================================================================

insert into public.permissions (code, module, description) values
  ('dashboard.view', 'Dashboard', 'Visualizar o painel inicial'),
  ('users.view', 'Usuários', 'Visualizar membros da equipe'),
  ('users.manage', 'Usuários', 'Convidar, editar, ativar e desativar membros'),
  ('settings.establishment.view', 'Configurações', 'Visualizar dados do estabelecimento'),
  ('settings.establishment.manage', 'Configurações', 'Editar dados do estabelecimento'),
  ('clients.view', 'Clientes', 'Visualizar clientes e histórico'),
  ('clients.manage', 'Clientes', 'Cadastrar, editar e desativar clientes'),
  ('appointments.view', 'Agendamentos', 'Visualizar agendamentos'),
  ('appointments.manage', 'Agendamentos', 'Criar, editar, reagendar e cancelar agendamentos'),
  ('appointments.manage_own', 'Agendamentos', 'Gerenciar os próprios agendamentos'),
  ('barbers.view', 'Profissionais', 'Visualizar profissionais e escalas'),
  ('barbers.manage', 'Profissionais', 'Cadastrar e configurar profissionais'),
  ('services.view', 'Serviços', 'Visualizar serviços'),
  ('services.manage', 'Serviços', 'Cadastrar e editar serviços'),
  ('financial.view', 'Financeiro', 'Visualizar contas e indicadores financeiros'),
  ('financial.manage', 'Financeiro', 'Gerenciar o financeiro'),
  ('financial.payables.manage', 'Financeiro', 'Gerenciar contas a pagar'),
  ('financial.receivables.manage', 'Financeiro', 'Gerenciar contas a receber'),
  ('commissions.view', 'Comissões', 'Visualizar comissões da equipe'),
  ('commissions.view_own', 'Comissões', 'Visualizar as próprias comissões'),
  ('commissions.manage', 'Comissões', 'Calcular e registrar pagamentos de comissões'),
  ('inventory.view', 'Estoque', 'Visualizar produtos e movimentações'),
  ('inventory.manage', 'Estoque', 'Gerenciar produtos e estoque'),
  ('sales.view', 'Vendas', 'Visualizar vendas'),
  ('sales.manage', 'Vendas', 'Registrar vendas de produtos'),
  ('reports.view', 'Relatórios', 'Visualizar relatórios'),
  ('reports.export', 'Relatórios', 'Exportar relatórios em PDF e Excel'),
  ('automations.view', 'Automações', 'Visualizar automações e logs'),
  ('automations.manage', 'Automações', 'Configurar automações e modelos de mensagem'),
  ('notifications.view', 'Notificações', 'Visualizar notificações'),
  ('audit.view', 'Auditoria', 'Consultar logs de auditoria')
on conflict (code) do update
  set module = excluded.module,
      description = excluded.description;

-- Administrador recebe todas as permissões cadastradas.
insert into public.role_permissions (role, permission_code)
select 'admin'::public.app_role, code from public.permissions
on conflict do nothing;

-- Gerente: operação + financeiro + relatórios.
insert into public.role_permissions (role, permission_code)
select 'gerente'::public.app_role, code
from public.permissions
where code in (
  'dashboard.view',
  'users.view',
  'settings.establishment.view',
  'settings.establishment.manage',
  'clients.view',
  'clients.manage',
  'appointments.view',
  'appointments.manage',
  'barbers.view',
  'barbers.manage',
  'services.view',
  'services.manage',
  'financial.view',
  'financial.manage',
  'financial.payables.manage',
  'financial.receivables.manage',
  'commissions.view',
  'commissions.manage',
  'inventory.view',
  'inventory.manage',
  'sales.view',
  'sales.manage',
  'reports.view',
  'reports.export',
  'automations.view',
  'notifications.view'
)
on conflict do nothing;

-- Recepcionista: agenda, clientes e operação autorizada.
insert into public.role_permissions (role, permission_code)
select 'recepcionista'::public.app_role, code
from public.permissions
where code in (
  'dashboard.view',
  'clients.view',
  'clients.manage',
  'appointments.view',
  'appointments.manage',
  'barbers.view',
  'services.view',
  'inventory.view',
  'sales.view',
  'sales.manage',
  'notifications.view'
)
on conflict do nothing;

-- Barbeiro: próprios atendimentos e comissões.
insert into public.role_permissions (role, permission_code)
select 'barbeiro'::public.app_role, code
from public.permissions
where code in (
  'dashboard.view',
  'clients.view',
  'appointments.view',
  'appointments.manage_own',
  'barbers.view',
  'services.view',
  'commissions.view_own',
  'notifications.view'
)
on conflict do nothing;
