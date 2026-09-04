-- Telefone canonico: um formato so pra comparar.
--
-- 48 das 59 linhas guardam o telefone formatado ('(44) 99181-1985'), heranca
-- do cadastro antigo; o checkout novo grava so digitos ('44991811985'). O
-- indice assinaturas_telefone_ativo_unico compara a string crua, entao ele
-- nunca enxergou as duas formas como o mesmo numero: a invariante que ele
-- promete valia so pra base nova, e 7 das 10 assinaturas ATIVAS hoje estao no
-- formato antigo, invisiveis pra ele.
--
-- O bot, por outro lado, casa por subsequencia de digitos e enxerga as duas.
-- Essa discordancia entre quem valida (indice) e quem consulta (bot) e a
-- brecha por onde as contas gemeas nascem. Ver 20260828120000.
--
-- Coluna GERADA de proposito: nao ha o que manter em sincronia, nem trigger
-- pra esquecer. O Postgres recalcula a cada escrita de `telefone`.

begin;

alter table public.assinaturas
  add column if not exists telefone_digitos text
  generated always as (
    case
      when regexp_replace(coalesce(telefone, ''), '[^0-9]', '', 'g') like '55%'
       and length(regexp_replace(coalesce(telefone, ''), '[^0-9]', '', 'g')) >= 12
      then substr(regexp_replace(coalesce(telefone, ''), '[^0-9]', '', 'g'), 3)
      else regexp_replace(coalesce(telefone, ''), '[^0-9]', '', 'g')
    end
  ) stored;

comment on column public.assinaturas.telefone_digitos is
  'So digitos, sem DDI 55. Espelha extrairEssenciaTelefone() do IA-ATENDIMENTO. E por esta coluna que se compara telefone — nunca pela crua.';

-- Mesma postura da migration anterior: se ja houver violacao, para e aponta
-- quem precisa de conserto manual, em vez de aplicar em silencio.
--
-- Conferido em 04/09/2026: a base tem UMA colisao (44991711314, Rodrigo
-- Gravena) e apenas uma das duas linhas esta ativa, entao o indice passa.
do $$
declare
  conflitos text;
begin
  select string_agg(telefone_digitos || ' (' || n || ' ativas)', ', ')
    into conflitos
    from (
      select telefone_digitos, count(*) as n
        from public.assinaturas
       where ativo is true and telefone_digitos <> ''
       group by telefone_digitos
      having count(*) > 1
    ) t;

  if conflitos is not null then
    raise exception 'Telefones (canonicos) com mais de uma assinatura ativa: %', conflitos;
  end if;
end $$;

create unique index if not exists assinaturas_telefone_digitos_ativo_unico
  on public.assinaturas (telefone_digitos)
  where ativo is true and telefone_digitos <> '';

-- Serve as buscas do checkout e do webhook (que passam a comparar por aqui).
create index if not exists assinaturas_telefone_digitos_idx
  on public.assinaturas (telefone_digitos)
  where telefone_digitos <> '';

-- O antigo vira redundante e estritamente mais fraco: ele deixava passar o
-- par '(44) 99171-1314' / '44991711314', que o novo barra.
drop index if exists public.assinaturas_telefone_ativo_unico;

commit;
