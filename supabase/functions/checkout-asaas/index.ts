// Substitui a checkout-session (Stripe). Cria a conta no Auth, registra a
// assinatura como PENDENTE e devolve uma URL pra onde o navegador deve ir.
//
// Diferenca central pro fluxo antigo: aqui NADA e ativado. A conta so vira
// ativa quando o asaas-webhook recebe confirmacao do gateway. No Stripe a
// fatura de R$ 0,00 do trial disparava invoice.paid e liberava a conta na
// hora — inclusive pra quem fechava a aba sem cadastrar cartao.
//
// Cartao -> checkout hospedado do Asaas (RECURRENT). O cartao fica salvo e a
//           renovacao e automatica. O Asaas coleta CPF/endereco na pagina dele.
// PIX    -> assinatura via API. O Asaas gera uma cobranca por ciclo e avisa o
//           cliente. Exige CPF nosso, porque nao ha pagina do Asaas coletando.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import {
  asaas, AsaasError, calcularValor, digitos, itensDoPlano,
  normalizarExtras, normalizarPlano, primeiroVencimento, TRIAL_DAYS,
  type Metodo,
} from '../_shared/asaas.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SITE_URL = Deno.env.get('SITE_URL') ?? 'https://www.zappoupe.com.br'

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
)

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status,
  })
}

/**
 * rodrigoogravena@gmail.com -> rod***************@gmail.com
 *
 * Mascarado porque a mensagem de conflito e devolvida pra quem so digitou um
 * telefone: sem mascara, o checkout viraria um consultor de "que e-mail usa
 * este numero?". O prefixo basta pra pessoa reconhecer a propria conta.
 *
 * null quando nao ha e-mail utilizavel (linha legada): quem chama troca a
 * mensagem em vez de escrever "na conta outra conta".
 */
function mascararEmail(email: string): string | null {
  const [usuario, dominio] = String(email ?? '').split('@')
  if (!dominio || !usuario) return null
  return `${usuario.slice(0, 3)}${'*'.repeat(Math.max(usuario.length - 3, 1))}@${dominio}`
}

/** Acha o usuario do Auth pelo email, paginando. null se nao existir. */
async function acharUsuarioPorEmail(email: string) {
  const alvo = email.toLowerCase()
  const perPage = 1000
  for (let page = 1; ; page++) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage })
    if (error) throw error
    const users = data?.users ?? []
    const achado = users.find((u) => u.email?.toLowerCase() === alvo)
    if (achado) return achado
    if (users.length < perPage) return null
  }
}

/** Reaproveita o customer do Asaas se ja existir pra este CPF. */
async function acharOuCriarCustomer(nome: string, email: string, cpfCnpj: string, celular: string) {
  const busca = await asaas<{ data?: any[] }>(`/customers?cpfCnpj=${encodeURIComponent(cpfCnpj)}&limit=1`)
  const existente = busca?.data?.[0]
  if (existente?.id) return existente.id as string

  const criado = await asaas<{ id: string }>('/customers', {
    method: 'POST',
    body: { name: nome, email, cpfCnpj, mobilePhone: celular || undefined },
  })
  return criado.id
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const body = await req.json()

    const email = String(body.email ?? '').trim().toLowerCase()
    const nome = String(body.name ?? '').trim()
    const celular = digitos(body.phone)
    const senha = String(body.password ?? '')
    const metodo: Metodo = body.metodo === 'PIX' ? 'PIX' : 'CREDIT_CARD'
    const cpfCnpj = digitos(body.cpfCnpj)

    // ── Validacao (espelha a do frontend; o cliente e sempre suspeito) ──
    if (!nome || !email) return json({ error: 'Informe seu nome e e-mail antes de continuar.' }, 400)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: 'E-mail invalido.' }, 400)
    if (senha.length < 6) return json({ error: 'A senha deve ter pelo menos 6 caracteres.' }, 400)
    if (celular.length < 10 || celular.length > 11) {
      return json({ error: 'Celular invalido. Informe DDD + numero.' }, 400)
    }
    // No cartao o CPF e coletado pelo Asaas; no PIX quem cria o customer somos nos.
    if (metodo === 'PIX' && cpfCnpj.length !== 11 && cpfCnpj.length !== 14) {
      return json({ error: 'Informe um CPF valido para pagar com PIX.' }, 400)
    }

    const plano = normalizarPlano(body.planType)
    const isAnual = !!body.isAnnual
    const extras = normalizarExtras(plano, body.extraMembers)
    const valor = calcularValor(plano, isAnual, extras)
    const vencimento = primeiroVencimento(TRIAL_DAYS)

    // ── 0. O telefone ja pertence a uma assinatura ATIVA de OUTRA conta? ──
    //
    // E daqui que nascem as contas gemeas. Caso real (Rodrigo Gravena):
    // abandonou o checkout as 16:05 e refez as 16:10 com o e-mail escrito
    // diferente. Ficou com duas linhas no mesmo telefone — o bot passou a
    // gravar os gastos na conta que pagou e ele seguiu logando na outra,
    // vendo o painel vazio. Barrar aqui e o unico ponto onde da pra impedir
    // o par de nascer; depois so resta juntar as contas na mao.
    //
    // Roda ANTES de tocar no Auth: recusar depois deixaria um usuario orfao.
    // Mesmo e-mail passa direto — e a propria pessoa renovando ou trocando
    // de plano, nao uma conta gemea.
    //
    // Compara por telefone_digitos, NUNCA pela coluna crua: 48 das 59 linhas
    // guardam o telefone formatado ('(44) 99181-1985') e 7 das 10 assinaturas
    // ativas estao nesse formato. Uma comparacao exata na coluna crua nao veria
    // nenhuma delas — a checagem passaria batido justamente nos casos legados.
    // Ver a migration 20260904090000.
    const { data: mesmoTelefone, error: erroTelefone } = await supabaseAdmin
      .from('assinaturas')
      .select('email')
      .eq('telefone_digitos', celular)
      .eq('ativo', true)
      .limit(5)
    if (erroTelefone) throw erroTelefone

    const gemea = mesmoTelefone?.find((a) => (a.email ?? '').toLowerCase() !== email)
    if (gemea) {
      const conta = mascararEmail(gemea.email ?? '')
      return json({
        error: conta
          ? `Este celular ja tem uma assinatura ativa na conta ${conta}. Entre com esse `
            + `e-mail para gerenciar o seu plano. Se voce nao reconhece essa conta, fale `
            + `com o suporte antes de assinar de novo.`
          : `Este celular ja tem uma assinatura ativa em outra conta. Fale com o suporte `
            + `para recuperar o acesso antes de assinar de novo.`,
      }, 409)
    }

    // ── 1. Conta no Auth (cria ou atualiza a senha de quem ja existia) ──
    let userId: string | undefined

    const { data: criado, error: erroCriar } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true,
      user_metadata: { name: nome, phone: celular },
    })

    if (criado?.user?.id) {
      userId = criado.user.id
    } else if (erroCriar) {
      const existente = await acharUsuarioPorEmail(email)
      if (!existente) throw erroCriar
      userId = existente.id
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: senha,
        user_metadata: { name: nome, phone: celular },
      })
    }

    if (!userId) return json({ error: 'Nao foi possivel criar o usuario.' }, 400)

    // ── 2. Assinatura PENDENTE. Quem libera e o webhook, nunca esta funcao. ──
    //
    // ATENCAO: este upsert vira UPDATE quando a linha ja existe, entao ele
    // NAO pode rebaixar quem ja esta pagando. Antes ele gravava ativo=false
    // e trocava o acesso_ate real por fim-de-trial sem olhar o estado atual:
    // bastava um cliente ativo reabrir o checkout — trocar de plano, clicar
    // de novo no CTA da LP — e abandonar pra sair de la inativo, com o
    // periodo pago apagado e NADA que o trouxesse de volta, porque checkout
    // abandonado nao gera webhook nenhum.
    //
    // Regra: quem ja tem acesso so muda de estado pela mao do webhook.
    const { data: atual, error: erroAtual } = await supabaseAdmin
      .from('assinaturas')
      .select('ativo, acesso_ate')
      .eq('id', userId)
      .maybeSingle()
    if (erroAtual) throw erroAtual

    const linha: Record<string, unknown> = {
      id: userId,
      nome,
      email,
      telefone: celular,
      plano,
      is_anual: isAnual,
      membros_extras: extras,
      gateway: 'asaas',
      metodo_pagamento: metodo,
    }

    if (atual?.ativo === true) {
      // Cliente em dia refazendo o checkout: ativo, status e acesso_ate ficam
      // exatamente como estao. O ciclo novo so entra quando o pagamento
      // confirmar, e ate la o periodo que ele ja pagou continua valendo.
      console.log(
        `Checkout reaberto pelo assinante ativo ${userId}; acesso preservado ` +
        `(acesso_ate=${atual.acesso_ate ?? 'sem data'}).`,
      )
    } else {
      linha.ativo = false
      linha.status = 'pending'
      // Fim do trial gravado aqui, onde a data e conhecida com certeza. O
      // webhook nao recalcula: o Asaas responde nextDueDate ja avancado um
      // ciclo e derivar dali daria o dobro do trial de graca.
      linha.acesso_ate = new Date(`${vencimento}T00:00:00Z`).toISOString()
    }

    const { error: erroAssinatura } = await supabaseAdmin.from('assinaturas').upsert(linha)
    if (erroAssinatura) throw erroAssinatura

    // ── 3. Abre a cobranca no Asaas ──
    if (metodo === 'CREDIT_CARD') {
      // Sem customerData de proposito: com ele o Asaas passa a exigir
      // endereco completo (address, addressNumber, postalCode, province),
      // que o nosso formulario nao coleta. Omitindo, a pagina dele pergunta.
      const sessao = await asaas<{ id: string; link: string }>('/checkouts', {
        method: 'POST',
        body: {
          billingTypes: ['CREDIT_CARD'],
          chargeTypes: ['RECURRENT'],
          minutesToExpire: 60,
          externalReference: userId,
          callback: {
            successUrl: `${SITE_URL}/sucesso?metodo=cartao&venc=${vencimento}`,
            cancelUrl: `${SITE_URL}/checkout`,
            expiredUrl: `${SITE_URL}/checkout`,
          },
          items: itensDoPlano(plano, isAnual, extras),
          subscription: { cycle: isAnual ? 'YEARLY' : 'MONTHLY', nextDueDate: vencimento },
        },
      })

      await supabaseAdmin.from('assinaturas')
        .update({ asaas_checkout_id: sessao.id })
        .eq('id', userId)

      return json({ redirectUrl: sessao.link, metodo, valor, vencimento })
    }

    // ── PIX: assinatura direta. Precisa de customer, logo precisa de CPF. ──
    const customerId = await acharOuCriarCustomer(nome, email, cpfCnpj, celular)

    const assinaturaAsaas = await asaas<{ id: string }>('/subscriptions', {
      method: 'POST',
      body: {
        customer: customerId,
        billingType: 'PIX',
        value: valor,
        nextDueDate: vencimento,
        cycle: isAnual ? 'YEARLY' : 'MONTHLY',
        description: itensDoPlano(plano, isAnual, extras)[0].name,
        externalReference: userId,
      },
    })

    await supabaseAdmin.from('assinaturas').update({
      asaas_customer_id: customerId,
      asaas_subscription_id: assinaturaAsaas.id,
    }).eq('id', userId)

    // A cobranca do fim do trial ja nasce junto, mas NAO mandamos o cliente
    // pra ela: nao ha nada a pagar hoje, e cair numa tela de QR Code logo
    // depois de ler "7 dias gratis" parece cobranca indevida. Vai pro
    // /sucesso e a fatura segue como link secundario, pra quem quiser
    // adiantar ou ver a data.
    const cobrancas = await asaas<{ data?: any[] }>(`/subscriptions/${assinaturaAsaas.id}/payments`)
    const primeira = cobrancas?.data?.[0]

    return json({
      redirectUrl: `${SITE_URL}/sucesso?metodo=pix&venc=${vencimento}`,
      faturaUrl: primeira?.invoiceUrl ?? null,
      metodo,
      valor,
      vencimento,
    })
  } catch (erro) {
    if (erro instanceof AsaasError) {
      console.error('Asaas recusou:', erro.status, JSON.stringify(erro.body))
      return json({ error: erro.message }, 400)
    }
    console.error('Erro no checkout:', erro)
    return json({ error: (erro as Error).message ?? 'Erro inesperado.' }, 400)
  }
})
