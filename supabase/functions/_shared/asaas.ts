// Cliente do Asaas + regras de preco compartilhadas pelas Edge Functions.
//
// REGRA DE OURO: o valor cobrado NUNCA vem do navegador. O cliente manda
// apenas plano/ciclo/quantidade de membros e o valor e derivado aqui. Era
// assim no Stripe (via PRICE_* ids) e precisa continuar sendo, senao qualquer
// um edita o fetch no devtools e assina por R$ 0,01.

const BASE = Deno.env.get('ASAAS_BASE_URL') ?? 'https://api-sandbox.asaas.com/v3'
const KEY = Deno.env.get('ASAAS_API_KEY') ?? ''

export const TRIAL_DAYS = 7

// Dias de tolerancia depois do vencimento antes de cortar o acesso.
// PIX nao tem cobranca automatica: o cliente precisa agir todo ciclo, entao
// um corte no mesmo dia do vencimento gera reclamacao de quem so esqueceu.
export const DIAS_CARENCIA = Number(Deno.env.get('DIAS_CARENCIA') ?? '3')

export type PlanType = 'individual' | 'family'
export type Metodo = 'CREDIT_CARD' | 'PIX'

const PRECOS = {
  individual: { anual: 197.90, mensal: 39.90 },
  family: { anual: 397.90, mensal: 59.90 },
  extra: { anual: 178.80, mensal: 14.90 },
} as const

// A base tem 'individual' (43), 'family' (4) e um 'Family' (1) com F maiusculo
// que quebrava o lookup de preco no Stripe. Normaliza tudo na entrada.
export function normalizarPlano(raw: unknown): PlanType {
  return String(raw ?? '').trim().toLowerCase() === 'family' ? 'family' : 'individual'
}

export function normalizarExtras(plano: PlanType, raw: unknown): number {
  if (plano !== 'family') return 0
  const n = parseInt(String(raw ?? '0'), 10)
  if (!Number.isFinite(n) || n < 0) return 0
  return Math.min(n, 10)
}

/** Valor total do ciclo, em reais, com 2 casas. */
export function calcularValor(plano: PlanType, isAnual: boolean, extras: number): number {
  const ciclo = isAnual ? 'anual' : 'mensal'
  const base = PRECOS[plano][ciclo]
  const adicional = extras * PRECOS.extra[ciclo]
  return Math.round((base + adicional) * 100) / 100
}

/** Item do checkout hospedado do Asaas. */
export interface ItemCheckout {
  name: string
  description: string
  quantity: number
  value: number
}

export function itensDoPlano(plano: PlanType, isAnual: boolean, extras: number): ItemCheckout[] {
  const ciclo = isAnual ? 'anual' : 'mensal'
  const periodo = isAnual ? 'Anual' : 'Mensal'
  const nome = plano === 'individual' ? 'Individual' : 'Familia'

  // Anotado como ItemCheckout[] de proposito: PRECOS e `as const`, entao sem
  // a anotacao o TS infere o tipo do array a partir do primeiro item e passa
  // a recusar o valor do membro extra, que e um literal diferente.
  const itens: ItemCheckout[] = [{
    name: `ZapPoupe ${nome} ${periodo}`,
    description: `Assinatura ${periodo.toLowerCase()} do plano ${nome}`,
    quantity: 1,
    value: PRECOS[plano][ciclo],
  }]

  if (extras > 0) {
    itens.push({
      name: 'Membro extra',
      description: `${extras} membro(s) adicional(is)`,
      quantity: extras,
      value: PRECOS.extra[ciclo],
    })
  }

  return itens
}

/** Data de vencimento da primeira cobranca (fim do trial), em YYYY-MM-DD. */
export function primeiroVencimento(dias = TRIAL_DAYS): string {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() + dias)
  return d.toISOString().slice(0, 10)
}

/** So digitos. O Asaas rejeita telefone/CPF formatado em alguns endpoints. */
export function digitos(v: unknown): string {
  return String(v ?? '').replace(/\D/g, '')
}

export class AsaasError extends Error {
  constructor(msg: string, readonly status: number, readonly body: unknown) {
    super(msg)
  }
}

export async function asaas<T = any>(
  path: string,
  init: { method?: string; body?: unknown } = {},
): Promise<T> {
  if (!KEY) throw new Error('ASAAS_API_KEY nao configurada.')

  const res = await fetch(`${BASE}${path}`, {
    method: init.method ?? 'GET',
    headers: {
      'access_token': KEY,
      'Content-Type': 'application/json',
      'User-Agent': 'ZapPoupe',
    },
    body: init.body ? JSON.stringify(init.body) : undefined,
  })

  const texto = await res.text()
  let dados: any = null
  try { dados = texto ? JSON.parse(texto) : null } catch { /* resposta nao-JSON */ }

  if (!res.ok) {
    // O Asaas devolve { errors: [{ code, description }] }. A description e
    // escrita em portugues e serve pro usuario final.
    const desc = dados?.errors?.map((e: any) => e.description).filter(Boolean).join(' ')
    throw new AsaasError(desc || `Falha no Asaas (HTTP ${res.status})`, res.status, dados ?? texto)
  }

  return dados as T
}
