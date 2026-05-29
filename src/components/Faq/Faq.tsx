// src/components/Faq/Faq.tsx
import { useState, useEffect, useRef } from "react";
import IconMobile from "../../assets/mobile.svg";
import IconPromote from "../../assets/promote.svg";
import IconMoney from "../../assets/moneys.svg";
import IconBribe from "../../assets/bribe.svg";
import IconYesNo from "../../assets/yesno.svg";
import IconDecree from "../../assets/decree.svg";
import "./Faq.css";

const Chevron = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const FAQ_DATA = [
    {
        icon: IconMobile,
        question: "O ZapPoupe é um aplicativo?",
        answer: "Não! É um assistente que funciona diretamente no WhatsApp. Sem downloads, sem complicações.",
    },
    {
        icon: IconPromote,
        question: "Preciso falar com ele todos os dias?",
        answer: "Não precisa, porém quanto mais você usa o ZapPoupe, mais ele entende seu perfil e cria estratégias financeiras sob medida, ajudando você a economizar e planejar com muito mais clareza.",
    },
    {
        icon: IconMoney,
        question: "E se eu não entender de finanças?",
        answer: "Fique tranquilo(a)! O ZapPoupe foi feito para te auxiliar em todas as suas dúvidas sobre dinheiro. Ele explica tudo de forma simples, prática e fácil de entender, mesmo que você nunca tenha lidado com finanças antes.",
    },
    {
        icon: IconYesNo,
        question: "Como eu informo meus gastos e receitas?",
        answer: "Você pode mandar mensagens de texto, áudios ou até fotos das notas fiscais. O ZapPoupe entende tudo e registra para você.",
    },
    {
        icon: IconBribe,
        question: "O ZapPoupe funciona para quem tem renda variável ou informal?",
        answer: "Com certeza! Ele foi feito para se adaptar à sua realidade, seja salário fixo, renda informal ou até quem vive de freelas.",
    },
    {
        icon: IconDecree,
        question: "O ZapPoupe me ajuda a economizar de verdade?",
        answer: "Sim! Além de mostrar para onde o dinheiro está indo, ele te envia sugestões personalizadas para reduzir gastos e melhorar sua saúde financeira.",
    },
];

export const Faq = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);
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

    const toggleFaq = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section ref={sectionRef} className={`faq-section ${visible ? "is-visible" : ""}`} id="faq-section">
            <div className="faq-blob faq-blob--1" aria-hidden="true" />
            <div className="faq-blob faq-blob--2" aria-hidden="true" />

            <div className="faq-inner">
                {/* Lado esquerdo */}
                <div className="faq-left">
                    <span className="faq-eyebrow">
                        <span className="faq-eyebrow-dot" />
                        03 — DÚVIDAS
                    </span>
                    <h2 className="faq-title">
                        Perguntas <em>frequentes</em>
                    </h2>
                    <p className="faq-description">
                        É super normal ter algumas perguntas antes de dar o primeiro passo.
                        Separamos as dúvidas mais comuns de quem está prestes a transformar a
                        vida financeira. Dá uma olhadinha!
                    </p>
                </div>

                {/* Lado direito: acordeão */}
                <div className="faq-list">
                    {FAQ_DATA.map((item, index) => {
                        const isOpen = openIndex === index;
                        return (
                            <div
                                key={index}
                                className={`faq-item ${isOpen ? "open" : ""}`}
                                style={{ transitionDelay: `${0.1 + index * 0.07}s` }}
                            >
                                <button className="faq-item-header" onClick={() => toggleFaq(index)}>
                                    <span className="faq-icon-wrap">
                                        <img className="faq-icon" alt="" src={item.icon} />
                                    </span>
                                    <span className="faq-question">{item.question}</span>
                                    <span className="faq-chevron"><Chevron /></span>
                                </button>

                                <div className="faq-item-body">
                                    <div className="faq-item-body-inner">
                                        <p className="faq-answer">{item.answer}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};
