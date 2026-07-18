// src/components/Faq/Faq.tsx
import { useId, useState } from 'react';
import {
    ShieldCheck,
    Landmark,
    Smartphone,
    MessagesSquare,
    HelpCircle,
    Banknote,
    Undo2,
    type LucideIcon,
} from 'lucide-react';
import { useReveal } from '../../hooks/useReveal';
import { SECTIONS } from '../../lib/scroll';
import './Faq.css';

const Chevron = () => (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

interface FaqEntry {
    Icon: LucideIcon;
    question: string;
    answer: string;
}

const FAQ_DATA: FaqEntry[] = [
    {
        Icon: ShieldCheck,
        question: 'Meus dados financeiros estão seguros?',
        answer: 'Sim. Suas conversas são criptografadas pelo próprio WhatsApp, e seus dados ficam armazenados com criptografia e em conformidade com a LGPD. Nunca vendemos ou compartilhamos suas informações — elas são suas, ponto.',
    },
    {
        Icon: Landmark,
        question: 'Preciso conectar minha conta do banco?',
        answer: 'Não! O ZapPoupe não pede senha, não acessa sua conta e não se conecta a banco nenhum. Você só conta o que gastou, do seu jeito. Simples e seguro.',
    },
    {
        Icon: Smartphone,
        question: 'O ZapPoupe é um aplicativo?',
        answer: 'Não! É um assistente que funciona direto no WhatsApp que você já usa. Sem downloads, sem ocupar memória do celular, sem mais um app pra esquecer.',
    },
    {
        Icon: MessagesSquare,
        question: 'Preciso falar com ele todos os dias?',
        answer: 'Não. Você manda mensagem quando quiser — na hora do gasto ou tudo de uma vez no fim do dia. E ele também te procura: lembretes de contas e resumos chegam sozinhos.',
    },
    {
        Icon: HelpCircle,
        question: 'E se eu não entender nada de finanças?',
        answer: 'Melhor ainda — é exatamente pra você. Nada de jargão ou gráfico complicado: o ZapPoupe fala a sua língua e te mostra o essencial, um passo de cada vez.',
    },
    {
        Icon: Banknote,
        question: 'Funciona pra quem tem renda variável ou informal?',
        answer: 'Funciona muito bem. Você registra entradas e saídas conforme acontecem, e o ZapPoupe monta o retrato real do seu mês — mesmo que nenhum mês seja igual ao outro.',
    },
    {
        Icon: Undo2,
        question: 'E se eu não gostar? Como cancelo?',
        answer: 'Você cancela direto na conversa do WhatsApp, sem ligação e sem formulário. Não tem fidelidade nem multa. Nos primeiros 30 dias você não paga nada de qualquer forma — e se decidir cancelar depois, é só avisar por lá que a gente resolve com você.',
    },
];

export const Faq = () => {
    // No HTML todas começam fechadas — o primeiro clique é do usuário.
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const { ref, visible } = useReveal<HTMLElement>();
    const baseId = useId();

    const toggleFaq = (index: number) => setOpenIndex(openIndex === index ? null : index);

    return (
        <section
            ref={ref}
            id={SECTIONS.faq}
            className={`faq-section zp-section ${visible ? 'is-visible' : ''}`}
        >
            <div className="zp-container">
                <h2 className="zp-title zp-reveal">Perguntas frequentes</h2>
                <p className="zp-sub zp-reveal">
                    É normal ter dúvidas antes do primeiro passo. Essas são as mais comuns:
                </p>

                <div className="faq-wrap">
                    {FAQ_DATA.map((item, index) => {
                        const isOpen = openIndex === index;
                        const btnId = `${baseId}-q${index}`;
                        const panelId = `${baseId}-a${index}`;

                        return (
                            <div
                                key={item.question}
                                className={`faq-item zp-reveal ${isOpen ? 'open' : ''}`}
                                style={{ transitionDelay: `${0.05 * index}s` }}
                            >
                                <button
                                    className="faq-q"
                                    id={btnId}
                                    onClick={() => toggleFaq(index)}
                                    aria-expanded={isOpen}
                                    aria-controls={panelId}
                                >
                                    <span className="faq-q-text">
                                        <span className="faq-icon">
                                            <item.Icon size={19} strokeWidth={2} aria-hidden="true" />
                                        </span>
                                        {item.question}
                                    </span>
                                    <span className="faq-arrow"><Chevron /></span>
                                </button>

                                <div
                                    className="faq-a"
                                    id={panelId}
                                    role="region"
                                    aria-labelledby={btnId}
                                    /* inert em vez de hidden: tira do foco e do leitor de
                                       tela sem virar display:none, que mataria a animação */
                                    inert={!isOpen}
                                >
                                    <div className="faq-a-inner">
                                        <p>{item.answer}</p>
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
