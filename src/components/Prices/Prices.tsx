// src/components/Prices/Prices.tsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import "./Prices.css";

const Check = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const INDIVIDUAL_FEATURES = [
    "Registro de gastos por áudio, texto ou foto",
    "Categorização 100% automática pela IA",
    "Lembretes de vencimento de contas",
    "Gráficos de saúde financeira no WhatsApp",
];

const FAMILY_FEATURES = [
    "Tudo do plano Individual",
    "Até 3 membros incluídos",
    "Controles familiares e individuais separados",
    "Relatórios da família inteira",
];

export const Prices = () => {
    const navigate = useNavigate();
    const [isAnnual, setIsAnnual] = useState(true);
    const [extraMembers, setExtraMembers] = useState(0);
    const [visible, setVisible] = useState(false);
    const sectionRef = useRef<HTMLElement | null>(null);

    const prices = {
        individual: { annual: 197.90, monthly: 39.90 },
        family: { annual: 397.90, monthly: 59.90 },
        extraMember: { annual: 178.80, monthly: 14.90 },
    };

    useEffect(() => {
        const el = sectionRef.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting) {
                    setVisible(true);
                    obs.disconnect();
                }
            },
            { threshold: 0.12 },
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    const handleSubscribe = (planType: 'individual' | 'family') => {
        navigate('/checkout', {
            state: {
                type: planType,
                isAnnual: isAnnual,
                extraMembers: planType === 'family' ? extraMembers : 0,
            },
        });
    };

    const fmt = (v: number) => v.toFixed(2).replace('.', ',');

    // Desconto real do anual = quanto se economiza vs. pagar 12 meses no mensal
    const discountPct = (annual: number, monthly: number) =>
        Math.round((1 - annual / (monthly * 12)) * 100);

    const individualDiscount = discountPct(prices.individual.annual, prices.individual.monthly);
    const familyDiscount = discountPct(prices.family.annual, prices.family.monthly);
    const maxDiscount = Math.max(individualDiscount, familyDiscount);

    return (
        <section
            ref={sectionRef}
            className={`prices-section ${visible ? "is-visible" : ""}`}
            id="prices-section"
        >
            <div className="prices-blob prices-blob--1" aria-hidden="true" />
            <div className="prices-blob prices-blob--2" aria-hidden="true" />

            <div className="prices-content">
                <div className="prices-head">
                    <span className="zp-eyebrow prices-eyebrow">
                        <span className="zp-eyebrow-dot" />
                        03 — PLANOS
                    </span>
                    <h2 className="prices-title">
                        Escolha o plano certo pra <em>você e seu dinheiro</em>
                    </h2>
                    <p className="prices-sub">
                        Todo plano começa com 30 dias grátis. Sem cartão, sem pegadinha.
                    </p>
                </div>

                {/* --- TOGGLE MENSAL / ANUAL --- */}
                <div className="billing-toggle">
                    <span className={!isAnnual ? "active" : ""}>Mensal</span>
                    <button
                        className="toggle-switch"
                        onClick={() => setIsAnnual(!isAnnual)}
                        aria-label="Alternar cobrança mensal ou anual"
                    >
                        <span className={`toggle-knob ${isAnnual ? "annual" : "monthly"}`} />
                    </button>
                    <span className={isAnnual ? "active" : ""}>
                        Anual <span className="discount-badge">economize até {maxDiscount}%</span>
                    </span>
                </div>

                <div className="pricing-cards-container">

                    {/* --- CARD 1: INDIVIDUAL --- */}
                    <div className="price-card">
                        <div className="card-head">
                            <div>
                                <h3 className="plan-name">Individual</h3>
                                <p className="plan-tagline">Crescimento pessoal</p>
                            </div>
                            <span className="trial-badge">30 DIAS GRÁTIS</span>
                        </div>

                        <div className="price-block">
                            <span className="currency">R$</span>
                            <span className="amount">{isAnnual ? fmt(prices.individual.annual / 12) : fmt(prices.individual.monthly)}</span>
                            <span className="period">/mês</span>
                        </div>
                        <p className="monthly-equivalent">
                            {isAnnual ? (
                                <>
                                    cobrado anualmente (R$ {fmt(prices.individual.annual)}/ano){' '}
                                    <strong className="save-pct">· economize {individualDiscount}%</strong>
                                </>
                            ) : 'cobrado mensalmente, cancele quando quiser'}
                        </p>

                        <ul className="plan-features">
                            {INDIVIDUAL_FEATURES.map((f) => (
                                <li key={f}><span className="feat-check"><Check /></span>{f}</li>
                            ))}
                        </ul>

                        <button className="btn-subscribe" onClick={() => handleSubscribe('individual')}>
                            Começar 30 dias grátis
                        </button>
                        <p className="trial-disclaimer">Sem cobrança hoje. Cancele quando quiser durante o período gratuito.</p>
                    </div>

                    {/* --- CARD 2: FAMÍLIA (destaque) --- */}
                    <div className="price-card price-card--featured">
                        <span className="popular-badge">MAIS POPULAR</span>
                        <div className="card-head">
                            <div>
                                <h3 className="plan-name">Família</h3>
                                <p className="plan-tagline">Prosperidade conjunta</p>
                            </div>
                            <span className="trial-badge">30 DIAS GRÁTIS</span>
                        </div>

                        <div className="price-block">
                            <span className="currency">R$</span>
                            <span className="amount">{isAnnual ? fmt(prices.family.annual / 12) : fmt(prices.family.monthly)}</span>
                            <span className="period">/mês</span>
                        </div>
                        <p className="monthly-equivalent">
                            {isAnnual ? (
                                <>
                                    cobrado anualmente (R$ {fmt(prices.family.annual)}/ano){' '}
                                    <strong className="save-pct">· economize {familyDiscount}%</strong>
                                </>
                            ) : 'cobrado mensalmente, cancele quando quiser'}
                        </p>

                        <ul className="plan-features">
                            {FAMILY_FEATURES.map((f) => (
                                <li key={f}><span className="feat-check"><Check /></span>{f}</li>
                            ))}
                        </ul>

                        <div className="extra-member-box">
                            <p className="extra-title">Membros extras <span>(opcional)</span></p>
                            <div className="member-counter">
                                <button onClick={() => setExtraMembers(Math.max(0, extraMembers - 1))} aria-label="Remover membro">−</button>
                                <span>{extraMembers}</span>
                                <button onClick={() => setExtraMembers(extraMembers + 1)} aria-label="Adicionar membro">+</button>
                            </div>
                            <p className="extra-price">
                                + R$ {isAnnual ? fmt(prices.extraMember.annual / 12) : fmt(prices.extraMember.monthly)}/mês por pessoa
                                {isAnnual && ' (cobrado anualmente)'}
                            </p>
                        </div>

                        <button className="btn-subscribe btn-subscribe--light" onClick={() => handleSubscribe('family')}>
                            Começar 30 dias grátis
                        </button>
                        <p className="trial-disclaimer trial-disclaimer--light">Sem cobrança hoje. Cancele quando quiser durante o período gratuito.</p>
                    </div>

                </div>

                <p className="plans-note">
                    Menos que um lanche por mês pra nunca mais perguntar "pra onde foi meu
                    dinheiro?"
                </p>
            </div>
        </section>
    );
};
