-- Um telefone, no maximo uma assinatura ATIVA.
--
-- O bot acha o cliente por telefone com um ilike de subsequencia e pega
-- .limit(1). Quando duas linhas casam, ele precisa de um criterio — hoje ele
-- ordena por `ativo` primeiro (corrigido em IA-ATENDIMENTO), mas a ordenacao
-- so e determinista se existir no maximo UMA linha ativa por telefone.
-- Este indice garante essa invariante no banco, que e onde ela pertence.
--
-- Caso real: rodrigogravena@gmail.com abandonou o checkout as 16:05 e refez
-- as 16:10 como rodrigoogravena@gmail.com, que pagou. Duas linhas com o
-- telefone 44991711314 — uma 'pending' morta, uma ativa. O Postgres devolvia
-- a morta primeiro e o cliente, em dia, recebia "sua assinatura esta inativa".
--
-- Parcial de proposito (where ativo). Linha inativa duplicada e legitima e
-- precisa continuar existindo: checkout abandonado, assinatura antiga
-- cancelada, gente que troca de plano. O que nao pode e duas VALENDO.

begin;

-- Se ja houver violacao, o create index falha e a migracao para — melhor do
-- que aplicar em silencio e deixar o problema escondido. Esta consulta
-- aparece no log pra apontar exatamente quem precisa de conserto manual.
do $$
declare
  conflitos text;
begin
  select string_agg(telefone || ' (' || n || ' ativas)', ', ')
    into conflitos
    from (
      select telefone, count(*) as n
        from public.assinaturas
       where ativo is true and telefone is not null and telefone <> ''
       group by telefone
      having count(*) > 1
    ) t;

  if conflitos is not null then
    raise exception 'Telefones com mais de uma assinatura ativa: %', conflitos;
  end if;
end $$;

create unique index if not exists assinaturas_telefone_ativo_unico
  on public.assinaturas (telefone)
  where ativo is true and telefone is not null and telefone <> '';

commit;
