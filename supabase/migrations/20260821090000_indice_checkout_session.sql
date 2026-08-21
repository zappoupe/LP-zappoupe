-- Indice para resolver eventos do checkout hospedado.
--
-- Descoberto em teste real: o Asaas nao copia o externalReference da sessao
-- de checkout para a assinatura que ele cria. O unico elo que sobrevive e o
-- checkoutSession, presente na assinatura e em toda cobranca gerada por ela.
-- O asaas-webhook usa esta coluna para achar o dono do evento, entao ela
-- precisa de indice — sem ele todo webhook de cartao vira full scan.

create index if not exists assinaturas_asaas_checkout_id_idx
  on public.assinaturas (asaas_checkout_id)
  where asaas_checkout_id is not null;
