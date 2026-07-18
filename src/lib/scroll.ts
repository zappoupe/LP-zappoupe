// src/lib/scroll.ts

/** IDs das seções âncora da LP. Nav e footer dependem destes valores. */
export const SECTIONS = {
    features: 'features-section',
    prices: 'prices-section',
    faq: 'faq-section',
    footer: 'footer-section',
} as const;

export function scrollToId(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Destino de todo CTA principal da LP.
 *
 * A venda acontece em /checkout (Stripe), então o CTA leva o usuário até a
 * seção de planos, onde ele escolhe Individual/Família e o Prices navega
 * pro checkout com o plano no state. Não mandamos pro WhatsApp: o número
 * do mock era placeholder e o fluxo de pagamento real é o do Stripe.
 */
export function goToPlans() {
    scrollToId(SECTIONS.prices);
}

export function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
