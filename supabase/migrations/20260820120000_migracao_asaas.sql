-- Migracao Stripe -> Asaas.
--
-- Aditiva de proposito: nenhuma coluna do Stripe e removida. Os assinantes
-- antigos continuam legiveis enquanto a base nao terminar de rodar pro Asaas,
-- e a coluna `gateway` diz de quem e cada linha.

begin;

-- ── 1. Colunas do Asaas ──────────────────────────────────────────────────
alter table public.assinaturas
  add column if not exists gateway               text,
  add column if not exists metodo_pagamento      text,
  add column if not exists asaas_customer_id     text,
  add column if not exists asaas_subscription_id text,
  add column if not exists asaas_checkout_id     text,
  -- Ate quando o periodo pago vale. E o que impede o bug que tirou o acesso
  -- de um cliente anual em dia: todo corte consulta esta data antes.
  add column if not exists acesso_ate            timestamptz;

alter table public.extrato
  add column if not exists asaas_payment_id text;

-- Idempotencia do webhook: o Asaas reenvia evento quando recebe 500.
create unique index if not exists extrato_asaas_payment_id_key
  on public.extrato (asaas_payment_id)
  where asaas_payment_id is not null;

create index if not exists assinaturas_asaas_customer_id_idx
  on public.assinaturas (asaas_customer_id)
  where asaas_customer_id is not null;

create index if not exists assinaturas_asaas_subscription_id_idx
  on public.assinaturas (asaas_subscription_id)
  where asaas_subscription_id is not null;

-- ── 2. Marca a base existente como Stripe ────────────────────────────────
update public.assinaturas
   set gateway = 'stripe'
 where gateway is null;

alter table public.assinaturas
  alter column gateway set default 'asaas';

-- ── 3. Normaliza o plano ─────────────────────────────────────────────────
-- Havia 1 linha com 'Family' (F maiusculo). O codigo fazia priceIds[planType]
-- e estourava "ID do plano nao encontrado" pra esse cliente.
update public.assinaturas
   set plano = lower(plano)
 where plano is not null and plano <> lower(plano);

-- ── 4. Preenche acesso_ate na base atual ─────────────────────────────────
-- Quem ja pagou de verdade: ultimo pagamento + um ciclo.
update public.assinaturas a
   set acesso_ate = p.ultimo + (case when a.is_anual then interval '1 year'
                                     else interval '1 month' end)
  from (
    select user_id, max(data_pagamento) as ultimo
      from public.extrato
     where valor > 0
     group by user_id
  ) p
 where p.user_id = a.id
   and a.acesso_ate is null;

-- Quem esta em trial (nunca pagou): 30 dias a partir da criacao.
update public.assinaturas
   set acesso_ate = criado_em + interval '30 days'
 where acesso_ate is null
   and criado_em is not null;

-- ── 5. Restaura o cliente anual que perdeu acesso indevidamente ──────────
-- Pagou R$ 397,90 de plano anual em 02/04/2026 e foi marcado past_due /
-- ativo=false por deactivateByCustomer, que desativava sem checar periodo
-- pago. O acesso dele vale ate 02/04/2027.
update public.assinaturas a
   set ativo  = true,
       status = 'active'
  from public.extrato e
 where e.user_id = a.id
   and e.valor > 0
   and a.is_anual is true
   and a.status = 'past_due'
   and a.acesso_ate > now();

commit;

-- ── 6. Expiracao de acesso ───────────────────────────────────────────────
-- No Stripe, customer.subscription.deleted chegava no FIM do periodo pago e
-- era ele quem virava ativo=false. No Asaas o evento de cancelamento chega na
-- hora do pedido, nao no vencimento — entao ninguem cortaria o acesso depois
-- que acesso_ate passasse. Este job cobre essa lacuna.
--
-- Tambem serve de rede pra webhook perdido: se um PAYMENT_OVERDUE nao chegar,
-- o acesso ainda expira sozinho.

create or replace function public.expirar_acessos_vencidos()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  afetados integer;
begin
  -- A carencia repete a DIAS_CARENCIA das Edge Functions. Mantenha as duas
  -- em sincronia: aqui e o ultimo recurso, la e o caminho normal.
  update public.assinaturas
     set ativo = false,
         status = case when status = 'canceling' then 'canceled' else status end
   where ativo is true
     and acesso_ate is not null
     and acesso_ate + interval '3 days' < now();

  get diagnostics afetados = row_count;
  return afetados;
end;
$$;

-- Todo dia as 04:00 UTC (01:00 em Brasilia), longe do pico de uso.
select cron.unschedule('zappoupe-expirar-acessos')
 where exists (
   select 1 from cron.job where jobname = 'zappoupe-expirar-acessos'
 );

select cron.schedule(
  'zappoupe-expirar-acessos',
  '0 4 * * *',
  $$select public.expirar_acessos_vencidos()$$
);
