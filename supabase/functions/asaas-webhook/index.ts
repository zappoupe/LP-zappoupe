// Substitui a stripe-webhook. E o UNICO lugar do sistema que pode liberar ou
// cortar acesso — o checkout nunca ativa nada.
//
// Duas correcoes deliberadas em relacao a versao do Stripe:
//
// 1. O Stripe liberava a conta ao receber invoice.paid da fatura de R$ 0,00 do
//    trial, o que ativava quem nunca cadastrou cartao. Aqui a liberacao exige
//    CHECKOUT_PAID (cartao capturado) ou pagamento realmente confirmado.
//
// 2. deactivateByCustomer desativava por customer_id em qualquer falha, sem
//    olhar periodo pago — foi assim que um cliente de plano ANUAL, em dia,
//    perdeu acesso. Agora todo corte consulta acesso_ate: enquanto o periodo
//    pago nao venceu, nenhum evento derruba a conta.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import { asaas, DIAS_CARENCIA, TRIAL_DAYS } from '../_shared/asaas.ts'

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
)

const WEBHOOK_TOKEN = Deno.env.get('ASAAS_WEBHOOK_TOKEN') ?? ''

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
    status,
  })
}

/** Soma um ciclo a partir de hoje: define ate quando o acesso esta pago. */
function fimDoPeriodo(isAnual: boolean, base = new Date()): string {
  const d = new Date(base)
  if (isAnual) d.setUTCFullYear(d.getUTCFullYear() + 1)
  else d.setUTCMonth(d.getUTCMonth() + 1)
  return d.toISOString()
}

function emDias(dias: number, base = new Date()): string {
  const d = new Date(base)
  d.setUTCDate(d.getUTCDate() + dias)
  return d.toISOString()
}

/**
 * Descobre de quem e o evento.
 *
 * Duas descobertas do teste real com cartao moldaram esta funcao:
 *
 * 1. O Asaas NAO propaga o externalReference da sessao de checkout para a
 *    assinatura que ele cria a partir dela. So o evento CHECKOUT_PAID traz o
 *    nosso user_id; SUBSCRIPTION_CREATED e os PAYMENT_* chegam sem ele.
 *
 * 2. NAO da pra cair no e-mail. No checkout hospedado quem digita os dados e
 *    o cliente, na pagina do Asaas — ele pode (e vai) usar um e-mail
 *    diferente do que cadastrou na nossa conta. Casar por e-mail liberaria
 *    acesso pra pessoa errada.
 *
 * O elo que sempre existe e o checkoutSession: ele vem preenchido na
 * assinatura e em toda cobranca gerada, e nos ja gravamos esse id em
 * asaas_checkout_id quando abrimos a sessao.
 *
 * Devolve null quando nao da pra ter certeza — ignorar o evento e sempre
 * melhor do que mexer na assinatura de outra pessoa.
 */
async function resolverUserId(obj: any): Promise<string | null> {
  // NAO usar maybeSingle() aqui: ele devolve ERRO quando casa mais de uma
  // linha, e duas linhas dividindo o mesmo asaas_customer_id acontecem por
  // design — acharOuCriarCustomer reaproveita o customer por CPF, entao quem
  // assina duas vezes com e-mails diferentes gera duas assinaturas apontando
  // pro mesmo customer. O erro era engolido (so `data` era lido), a funcao
  // devolvia null e o evento sumia com HTTP 200: ativacao perdida pra sempre.
  const porColuna = async (coluna: string, valor: string) => {
    const { data, error } = await supabaseAdmin.from('assinaturas')
      .select('id')
      .eq(coluna, valor)
      .order('criado_em', { ascending: false, nullsFirst: false })
      .limit(1)
    if (error) throw new Error(`busca por ${coluna}: ${error.message}`)
    return data?.[0]?.id ?? null
  }

  // 1. externalReference — so o CHECKOUT_PAID e o fluxo PIX trazem.
  const ref = obj?.externalReference
  if (ref && /^[0-9a-f-]{36}$/i.test(String(ref))) return String(ref)

  // 2. checkoutSession — o elo do fluxo de cartao.
  //
  // No CHECKOUT_PAID o proprio objeto E o checkout, entao o id dele chega em
  // obj.id — nao em obj.checkoutSession, que so existe nos eventos derivados
  // (assinatura e cobrancas). Antes so obj.checkoutSession era testado: se o
  // externalReference nao viesse no payload, a resolucao falhava tendo o id
  // exato em maos. Testa os dois.
  const sessao = typeof obj?.checkoutSession === 'string'
    ? obj.checkoutSession
    : obj?.checkoutSession?.id
  for (const candidato of [sessao, obj?.id]) {
    if (!candidato) continue
    const id = await porColuna('asaas_checkout_id', String(candidato))
    if (id) return id
  }

  // 3. ids que ja vinculamos em eventos anteriores.
  const subId = obj?.subscription ?? obj?.id
  if (subId && String(subId).startsWith('sub_')) {
    const id = await porColuna('asaas_subscription_id', String(subId))
    if (id) return id
  }

  const custId = typeof obj?.customer === 'string' ? obj.customer : obj?.customer?.id
  if (custId) {
    const id = await porColuna('asaas_customer_id', String(custId))
    if (id) return id
  }

  return null
}

async function lerAssinatura(userId: string) {
  const { data, error } = await supabaseAdmin.from('assinaturas')
    .select('id, is_anual, plano, acesso_ate, status, asaas_customer_id, asaas_subscription_id')
    .eq('id', userId).maybeSingle()
  if (error) throw new Error(`leitura da assinatura ${userId}: ${error.message}`)
  return data
}

/** Codigo do Postgres para violacao de restricao unica. */
const VIOLACAO_UNICIDADE = '23505'

/**
 * Tira de campo a assinatura antiga que ocupa o mesmo telefone.
 *
 * A migration 20260828120000 garante no maximo UMA linha ativa por telefone.
 * Boa invariante, mas sem tratamento ela se volta contra o cliente: quando
 * alguem assina de novo com outro e-mail e a linha antiga ainda esta ativa, o
 * `ativo = true` da ativacao bate no indice, o update falha, o handler devolve
 * 500 e o Asaas retenta pra sempre — a conta que ACABOU DE PAGAR nunca ativa,
 * e nada disso aparece pra quem pagou.
 *
 * Criterio: quem pagou agora fica com o telefone; a linha antiga sai.
 *
 * O historico de `transactions` NAO e migrado aqui de proposito — mover dado
 * financeiro de cliente e decisao humana, nao efeito colateral de webhook. O
 * console.error abaixo e o gatilho pro suporte juntar as duas contas.
 */
async function liberarTelefoneDuplicado(userId: string): Promise<boolean> {
  // telefone_digitos, nao a coluna crua: a linha antiga costuma ser legada e
  // estar formatada, e comparar string crua nao acharia a duplicata que o
  // proprio indice acabou de barrar. Ver a migration 20260904090000.
  const { data: alvo, error: erroAlvo } = await supabaseAdmin.from('assinaturas')
    .select('telefone_digitos').eq('id', userId).maybeSingle()
  if (erroAlvo) throw new Error(`leitura do telefone de ${userId}: ${erroAlvo.message}`)
  if (!alvo?.telefone_digitos) return false

  const { data: antigas, error: erroBusca } = await supabaseAdmin.from('assinaturas')
    .select('id, email')
    .eq('telefone_digitos', alvo.telefone_digitos)
    .eq('ativo', true)
    .neq('id', userId)
  if (erroBusca) {
    throw new Error(`busca de duplicata no telefone ${alvo.telefone_digitos}: ${erroBusca.message}`)
  }
  if (!antigas?.length) return false

  for (const antiga of antigas) {
    const { error } = await supabaseAdmin.from('assinaturas')
      .update({ ativo: false, status: 'substituida' })
      .eq('id', antiga.id)
    if (error) throw new Error(`desativacao da duplicata ${antiga.id}: ${error.message}`)

    console.error(
      `CONTAS GEMEAS no telefone ${alvo.telefone_digitos}: assinatura ${antiga.id} (${antiga.email}) ` +
      `desativada em favor de ${userId}, que acabou de pagar. As transactions antigas ` +
      `continuam sob ${antiga.id} — juntar as contas manualmente.`,
    )
  }

  return true
}

/**
 * Update que NAO falha em silencio.
 *
 * Todos os writes daqui ignoravam o `error` e devolviam 200 pro Asaas. Com
 * isso qualquer falha de escrita — indisponibilidade, constraint, coluna
 * ausente — virava uma ativacao perdida sem rastro: o Asaas marcava a entrega
 * como bem-sucedida e nunca reenviava o evento. Agora o erro sobe, o handler
 * devolve 500 e o Asaas retenta, que e exatamente o comportamento que o
 * comentario do catch la embaixo ja prometia.
 *
 * Trata ainda a colisao do indice de telefone unico, que sem isso deixaria
 * o Asaas retentando pra sempre uma ativacao que nunca passa: ver
 * liberarTelefoneDuplicado acima.
 */
async function atualizarAssinatura(userId: string, patch: Record<string, unknown>) {
  const { error } = await supabaseAdmin.from('assinaturas')
    .update(patch).eq('id', userId)
  if (!error) return

  // Ativacao barrada por outra linha ativa no mesmo telefone: resolve e repete.
  // So para ativacao — num corte de acesso a colisao nao faz sentido e o erro
  // deve subir normalmente.
  if (error.code === VIOLACAO_UNICIDADE && patch.ativo === true) {
    if (await liberarTelefoneDuplicado(userId)) {
      const { error: erroRepetido } = await supabaseAdmin.from('assinaturas')
        .update(patch).eq('id', userId)
      if (!erroRepetido) return
      throw new Error(
        `update da assinatura ${userId} apos liberar o telefone: ${erroRepetido.message}`,
      )
    }
  }

  throw new Error(`update da assinatura ${userId}: ${error.message}`)
}

/** Cartao capturado no checkout hospedado: comeca o periodo de teste. */
async function iniciarTrial(userId: string, checkout: any) {
  const assinatura = await lerAssinatura(userId)
  if (!assinatura) return { skipped: 'assinatura_inexistente' }

  const patch: Record<string, unknown> = { ativo: true, status: 'trialing' }

  // acesso_ate ja foi gravado pelo checkout-asaas com a data exata do fim do
  // trial. NAO recalcular a partir do payload: o Asaas devolve o nextDueDate
  // da assinatura ja avancado um ciclo (criamos pra 19/09 e ele responde
  // 19/10), o que daria 60 dias de acesso gratis em vez de 30.
  if (!assinatura.acesso_ate) {
    patch.acesso_ate = checkout?.subscription?.nextDueDate
      ? new Date(checkout.subscription.nextDueDate).toISOString()
      : emDias(TRIAL_DAYS)
  }

  const custId = typeof checkout?.customer === 'string' ? checkout.customer : checkout?.customer?.id
  if (custId) patch.asaas_customer_id = custId

  await atualizarAssinatura(userId, patch)
  return { ok: true, status: 'trialing' }
}

/** Pagamento confirmado de verdade: renova o periodo pago. */
async function confirmarPagamento(userId: string, pagamento: any) {
  const assinatura = await lerAssinatura(userId)
  if (!assinatura) return { skipped: 'assinatura_inexistente' }

  const valor = Number(pagamento?.value ?? 0)

  const patch: Record<string, unknown> = {
    ativo: true,
    status: 'active',
    acesso_ate: fimDoPeriodo(!!assinatura.is_anual),
  }
  const custId = typeof pagamento?.customer === 'string' ? pagamento.customer : pagamento?.customer?.id
  if (custId) patch.asaas_customer_id = custId
  if (pagamento?.subscription) patch.asaas_subscription_id = pagamento.subscription

  await atualizarAssinatura(userId, patch)

  // Extrato so recebe dinheiro que entrou. A versao do Stripe gravava as
  // faturas de R$ 0,00 do trial e por isso 54 das 57 linhas eram zeradas.
  if (valor > 0 && pagamento?.id) {
    const { error } = await supabaseAdmin.from('extrato').upsert({
      user_id: userId,
      valor,
      plano: assinatura.plano,
      asaas_payment_id: pagamento.id,
      data_pagamento: pagamento?.paymentDate ?? pagamento?.clientPaymentDate ?? new Date().toISOString(),
    }, { onConflict: 'asaas_payment_id' })
    if (error) console.error('Falha ao gravar extrato:', error.message)
  }

  return { ok: true, status: 'active', valor }
}

/**
 * Corte de acesso. So derruba quem realmente nao tem periodo pago valido.
 * `motivo` vira o status; `imediato` pula a carencia (estorno/chargeback).
 */
async function cortarAcesso(userId: string, motivo: string, imediato = false) {
  const assinatura = await lerAssinatura(userId)
  if (!assinatura) return { skipped: 'assinatura_inexistente' }

  if (!imediato && assinatura.acesso_ate) {
    const limite = new Date(assinatura.acesso_ate)
    limite.setUTCDate(limite.getUTCDate() + DIAS_CARENCIA)
    if (limite > new Date()) {
      // Periodo pago ainda de pe: marca a pendencia mas NAO tira o acesso.
      await atualizarAssinatura(userId, { status: motivo })
      return { ok: true, mantido: true, acesso_ate: assinatura.acesso_ate }
    }
  }

  await atualizarAssinatura(userId, { ativo: false, status: motivo })
  return { ok: true, cortado: true }
}

serve(async (req) => {
  // O Asaas nao assina o corpo como o Stripe: a autenticacao e um token fixo
  // que configuramos junto com a URL do webhook.
  const token = req.headers.get('asaas-access-token') ?? ''
  if (!WEBHOOK_TOKEN || token !== WEBHOOK_TOKEN) {
    console.error('Webhook recusado: token invalido.')
    return json({ error: 'unauthorized' }, 401)
  }

  let evento: any
  try {
    evento = await req.json()
  } catch {
    return json({ error: 'payload invalido' }, 400)
  }

  const tipo: string = evento?.event ?? ''
  const pagamento = evento?.payment
  const checkout = evento?.checkout ?? evento?.checkoutSession
  const assinatura = evento?.subscription

  const alvo = pagamento ?? checkout ?? assinatura
  if (!alvo) return json({ received: true, ignorado: tipo, motivo: 'sem objeto' })

  try {
    const userId = await resolverUserId(alvo)
    if (!userId) {
      // Nao e erro: pode ser cobranca avulsa criada no painel do Asaas.
      console.warn(`Evento ${tipo} sem user_id resolvivel.`)
      return json({ received: true, ignorado: tipo, motivo: 'user_id_nao_resolvido' })
    }

    switch (tipo) {
      case 'CHECKOUT_PAID':
        return json({ received: true, ...(await iniciarTrial(userId, checkout)) })

      case 'PAYMENT_CONFIRMED':
      case 'PAYMENT_RECEIVED':
        return json({ received: true, ...(await confirmarPagamento(userId, pagamento)) })

      case 'PAYMENT_OVERDUE':
        return json({ received: true, ...(await cortarAcesso(userId, 'past_due')) })

      case 'PAYMENT_CREDIT_CARD_CAPTURE_REFUSED':
        return json({ received: true, ...(await cortarAcesso(userId, 'past_due')) })

      case 'PAYMENT_REFUNDED':
      case 'PAYMENT_CHARGEBACK_REQUESTED':
        return json({ received: true, ...(await cortarAcesso(userId, 'refunded', true)) })

      case 'SUBSCRIPTION_CREATED':
      case 'SUBSCRIPTION_UPDATED': {
        // Guarda o id da assinatura — sem ele o cancelamento vira mentira:
        // marcaria cancelado no nosso banco enquanto o Asaas seguiria cobrando.
        const patch: Record<string, unknown> = { asaas_subscription_id: assinatura?.id }
        const custId = typeof assinatura?.customer === 'string'
          ? assinatura.customer : assinatura?.customer?.id
        if (custId) patch.asaas_customer_id = custId
        await atualizarAssinatura(userId, patch)

        // Carimba o nosso user_id na assinatura la no Asaas. Ela nasce sem
        // externalReference quando vem do checkout hospedado, e sem isso todo
        // evento futuro dependeria da cadeia checkoutSession. Com o carimbo,
        // os PAYMENT_* seguintes resolvem direto pelo caminho 1.
        if (assinatura?.id && !assinatura?.externalReference) {
          try {
            await asaas(`/subscriptions/${assinatura.id}`, {
              method: 'PUT',
              body: { externalReference: userId },
            })
          } catch (e) {
            // Nao e fatal: o checkoutSession continua resolvendo.
            console.warn('Nao consegui carimbar externalReference:', (e as Error).message)
          }
        }

        // Este e o unico evento que serve aos DOIS metodos para iniciar o
        // trial. No cartao ele so dispara depois do checkout hospedado
        // concluir (cartao ja capturado). No PIX nada e pago hoje, entao
        // CHECKOUT_PAID/PAYMENT_CONFIRMED nunca chegariam e o cliente ficaria
        // preso em 'pending' pra sempre.
        if (tipo === 'SUBSCRIPTION_CREATED') {
          return json({
            received: true,
            vinculado: assinatura?.id,
            ...(await iniciarTrial(userId, { subscription: { nextDueDate: assinatura?.nextDueDate } })),
          })
        }

        return json({ received: true, vinculado: assinatura?.id })
      }

      case 'SUBSCRIPTION_DELETED':
      case 'SUBSCRIPTION_INACTIVATED':
        // Cancelamento nao corta na hora: quem pagou usa ate o fim do periodo.
        return json({ received: true, ...(await cortarAcesso(userId, 'canceled')) })

      default:
        return json({ received: true, ignorado: tipo })
    }
  } catch (erro) {
    console.error(`Erro processando ${tipo}:`, erro)
    // 500 faz o Asaas reenviar — melhor repetir do que perder uma ativacao.
    return json({ error: (erro as Error).message }, 500)
  }
})
