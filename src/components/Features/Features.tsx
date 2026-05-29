// src/components/Features/Features.tsx
import { useState, useEffect, useRef } from "react";
import "./Features.css";

const ArrowUpRight = () => (
    <svg className="bento-arrow" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M7 17L17 7M17 7H8M17 7V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

interface Feature {
    label: string;
    title: string;
    desc: string;
    tags?: string[];
}

const FEATURES: Feature[] = [
    {
        label: "EM DESTAQUE",
        title: "Adicione seus gastos com apenas uma mensagem",
        desc: 'Basta mandar algo como "mercado 120 reais" e o ZapPoupe atualiza tudo sozinho — saldo, categorias e histórico direto no seu WhatsApp.',
        tags: ["WhatsApp", "Texto, áudio ou foto", "Automático"],
    },
    {
        label: "REGISTRO",
        title: "Grave um áudio ou envie uma foto",
        desc: "Não quer digitar? Manda um áudio ou foto do comprovante. O ZapPoupe entende tudo e registra automaticamente. Você fala, ele organiza.",
    },
    {
        label: "LEMBRETES",
        title: "Lembretes que salvam o seu mês",
        desc: "Nunca mais esqueça de pagar uma conta. O assistente te avisa antes do vencimento e ainda ajuda a organizar os valores.",
    },
    {
        label: "INTELIGÊNCIA",
        title: "Categorias inteligentes e automáticas",
        desc: "Mercado, transporte, lazer ou boletos: o ZapPoupe reconhece e organiza tudo sozinho, sem você precisar ajustar nada.",
    },
    {
        label: "VISÃO GERAL",
        title: "Controle total do seu dinheiro",
        desc: "Veja como está gastando e onde dá pra economizar. Gráficos claros e categorias organizadas mostram sua saúde financeira real — menos surpresas no fim do mês.",
    },
];

export const Features = () => {
    const [visible, setVisible] = useState(false);
    const sectionRef = useRef<HTMLElement | null>(null);

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

    return (
        <section ref={sectionRef} id="features-section" className={`features-section ${visible ? "is-visible" : ""}`}>
            <div className="features-grid-lines" aria-hidden="true" />

            <div className="features-inner">
                <div className="features-head">
                    <span className="features-eyebrow">
                        <span className="features-eyebrow-dot" />
                        01 — RECURSOS
                    </span>
                    <h2 className="features-title">
                        Conheça alguns recursos do <em>ZapPoupe</em>
                    </h2>
                </div>

                <div className="bento">
                    {FEATURES.map((f, i) => (
                        <article
                            className={`bento-card ${i === 0 ? "bento-card--featured" : ""}`}
                            key={i}
                            style={{ transitionDelay: `${0.1 + i * 0.09}s` }}
                        >
                            <div className="bento-top">
                                <span className="bento-label">
                                    {String(i + 1).padStart(2, "0")} — {f.label}
                                </span>
                                <ArrowUpRight />
                            </div>

                            <div className="bento-body">
                                <h3 className="bento-title">{f.title}</h3>
                                <p className="bento-desc">{f.desc}</p>

                                {f.tags && (
                                    <div className="bento-tags">
                                        {f.tags.map((t) => (
                                            <span className="bento-tag" key={t}>{t}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
};
