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
    "Tudo do plano individual",
    "Até 3 membros incluídos",
    "Controles familiares e individuais",
    "Categorização e relatórios familiares",
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
                    <span className="prices-eyebrow">
                        <span className="prices-eyebrow-dot" />
                        02 — PLANOS
                    </span>
                    <h2 className="prices-title">
                        Escolha o plano certo para <em>você e seu dinheiro</em>
                    </h2>
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
                        Anual <span className="discount-badge">-20%</span>
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
                            <span className="amount">{isAnnual ? fmt(prices.individual.annual) : fmt(prices.individual.monthly)}</span>
                            <span className="period">{isAnnual ? '/ano' : '/mês'}</span>
                        </div>
                        <p className="monthly-equivalent">
                            {isAnnual ? `equivalente a R$ ${fmt(prices.individual.annual / 12)} /mês` : ' '}
                        </p>

                        <ul className="plan-features">
                            {INDIVIDUAL_FEATURES.map((f) => (
                                <li key={f}><span className="feat-check"><Check /></span>{f}</li>
                            ))}
                        </ul>

                        <button className="btn-subscribe" onClick={() => handleSubscribe('individual')}>
                            COMEÇAR 30 DIAS GRÁTIS
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
                            <span className="amount">{isAnnual ? fmt(prices.family.annual) : fmt(prices.family.monthly)}</span>
                            <span className="period">{isAnnual ? '/ano' : '/mês'}</span>
                        </div>
                        <p className="monthly-equivalent">
                            {isAnnual ? `equivalente a R$ ${fmt(prices.family.annual / 12)} /mês` : ' '}
                        </p>

                        <ul className="plan-features">
                            {FAMILY_FEATURES.map((f) => (
                                <li key={f}><span className="feat-check"><Check /></span>{f}</li>
                            ))}
                        </ul>

                        <div className="extra-member-box">
                            <p className="extra-title">MEMBROS EXTRAS <span>(opcional)</span></p>
                            <div className="member-counter">
                                <button onClick={() => setExtraMembers(Math.max(0, extraMembers - 1))} aria-label="Remover membro">−</button>
                                <span>{extraMembers}</span>
                                <button onClick={() => setExtraMembers(extraMembers + 1)} aria-label="Adicionar membro">+</button>
                            </div>
                            <p className="extra-price">
                                + R$ {isAnnual ? fmt(prices.extraMember.annual) : fmt(prices.extraMember.monthly)} {isAnnual ? '/ano' : '/mês'} por membro
                            </p>
                        </div>

                        <button className="btn-subscribe btn-subscribe--light" onClick={() => handleSubscribe('family')}>
                            COMEÇAR 30 DIAS GRÁTIS
                        </button>
                        <p className="trial-disclaimer trial-disclaimer--light">Sem cobrança hoje. Cancele quando quiser durante o período gratuito.</p>
                    </div>

                </div>
            </div>
        </section>
    );
};
