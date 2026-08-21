// Cancelamento pedido pela propria cliente, la no zappoupe-user
// (ManagePlanModal -> supabase.functions.invoke('cancel-subscription')).
//
// O nome e o contrato de resposta ficam iguais de proposito: o app do usuario
// nao precisa mudar nada. O que mudou aqui dentro e que a funcao agora atende
// os dois gateways, porque a base velha do Stripe convive com a nova do Asaas
// ate o ultimo assinante antigo sair.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@12.0.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import { asaas, AsaasError } from '../_shared/asaas.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    // ── 1. Autentica pelo JWT: cada uma cancela so a propria assinatura ──
    const token = (req.headers.get('Authorization') ?? '').replace('Bearer ', '').trim()
    if (!token) throw new Error('Sessao invalida. Entre de novo e tente outra vez.')

    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token)
    if (userErr || !userData?.user) {
      throw new Error('Sessao invalida. Entre de novo e tente outra vez.')
    }
    const userId = userData.user.id

    // ── 2. Le a assinatura ──
    const { data: assinatura, error: assErr } = await supabaseAdmin
      .from('assinaturas')
      .select('id, gateway, stripe_subscription_id, asaas_subscription_id, status, ativo, acesso_ate')
      .eq('id', userId)
      .maybeSingle()
    if (assErr) throw assErr
    if (!assinatura) throw new Error('Assinatura nao encontrada nesta conta.')

    if (assinatura.status === 'canceled' || assinatura.status === 'canceling') {
      return json({ ok: true, alreadyCanceled: true })
    }

    const marcarCancelando = async (acessoAte: string | null) =>
      await supabaseAdmin.from('assinaturas').update({
        status: 'canceling',
        cancelado_em: new Date().toISOString(),
        ...(acessoAte ? { acesso_ate: acessoAte } : {}),
      }).eq('id', userId)

    // ── 3a. Asaas ──
    if (assinatura.gateway === 'asaas') {
      if (!assinatura.asaas_subscription_id) {
        // Checkout de cartao abandonado: a assinatura nunca chegou a existir
        // no Asaas, entao nao ha o que cancelar la fora.
        await marcarCancelando(null)
        return json({ ok: true, semGateway: true })
      }

      // O Asaas nao tem "cancel_at_period_end". Remover a assinatura para as
      // cobrancas futuras; o acesso ate o fim do periodo pago e garantido pelo
      // acesso_ate, que o webhook respeita antes de cortar qualquer conta.
      await asaas(`/subscriptions/${assinatura.asaas_subscription_id}`, { method: 'DELETE' })
      await marcarCancelando(null)

      return json({
        ok: true,
        cancelAtPeriodEnd: true,
        acessoAte: assinatura.acesso_ate ?? null,
      })
    }

    // ── 3b. Stripe (base legada) ──
    if (!assinatura.stripe_subscription_id) {
      await marcarCancelando(null)
      return json({ ok: true, semStripe: true })
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
      apiVersion: '2022-11-15',
    })

    const sub = await stripe.subscriptions.update(assinatura.stripe_subscription_id, {
      cancel_at_period_end: true,
    })

    const acessoAte = sub.current_period_end
      ? new Date(sub.current_period_end * 1000).toISOString()
      : null

    await marcarCancelando(acessoAte)

    return json({ ok: true, cancelAtPeriodEnd: true, acessoAte })
  } catch (error) {
    if (error instanceof AsaasError) {
      console.error('Asaas recusou o cancelamento:', error.status, JSON.stringify(error.body))
      return json({ error: error.message }, 400)
    }
    return json({ error: (error as Error).message }, 400)
  }
})
