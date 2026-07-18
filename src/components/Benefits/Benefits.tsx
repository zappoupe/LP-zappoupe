// src/components/Benefits/Benefits.tsx
import {
    Zap,
    BrainCircuit,
    BellRing,
    ChartPie,
    Briefcase,
    ShieldCheck,
    type LucideIcon,
} from 'lucide-react';
import { useReveal } from '../../hooks/useReveal';
import { SECTIONS } from '../../lib/scroll';
import './Benefits.css';

interface Benefit {
    Icon: LucideIcon;
    title: string;
    desc: string;
}

const BENEFITS: Benefit[] = [
    {
        Icon: Zap,
        title: 'Registra em 12 segundos, do jeito que sair',
        desc: 'Texto, áudio no trânsito ou foto da notinha amassada. Sem formulário, sem campo obrigatório, sem fricção — se você esquece de anotar hoje, o problema acaba aqui.',
    },
    {
        Icon: BrainCircuit,
        title: 'Categoriza sozinho, sem você escolher nada',
        desc: 'A IA entende "50 no mercado" e já sabe que é alimentação. Você nunca mais perde 10 minutos organizando linha de planilha.',
    },
    {
        Icon: BellRing,
        title: 'Avisa antes da conta vencer, não depois',
        desc: 'Lembretes chegam com antecedência. Menos juros, menos multa, menos aquele susto no extrato no fim do mês.',
    },
    {
        Icon: ChartPie,
        title: 'Mostra pra onde o dinheiro foi, sem gráfico complicado',
        desc: 'Resumo automático por categoria, direto na conversa. Você enxerga o padrão de gasto sem precisar interpretar planilha nenhuma.',
    },
    {
        Icon: Briefcase,
        title: 'Funciona mesmo com renda que varia todo mês',
        desc: 'MEI, autônomo, freelancer: você registra o que entra e sai conforme acontece, e o Zap monta o retrato real do seu mês — mesmo que nenhum mês seja igual ao outro.',
    },
    {
        Icon: ShieldCheck,
        title: 'Não vê sua senha, não toca na sua conta',
        desc: 'Sem open finance, sem acesso a banco, sem conexão nenhuma com sua conta. Você só conta o que gastou pelo WhatsApp — e ninguém, nem a gente, mexe no seu dinheiro.',
    },
];

export const Benefits = () => {
    const { ref, visible } = useReveal<HTMLElement>();

    return (
        <section
            ref={ref}
            id={SECTIONS.features}
            className={`benefits zp-section ${visible ? 'is-visible' : ''}`}
        >
            <div className="zp-container">
                <div className="benefits-head zp-reveal">
                    <span className="zp-eyebrow">
                        <span className="zp-eyebrow-dot" />
                        01 — BENEFÍCIOS
                    </span>
                    <h2 className="zp-title">Tudo que muda quando o Zap cuida da sua grana</h2>
                    <p className="zp-sub">
                        Não é só "anotar gasto". É nunca mais tomar decisão financeira no escuro.
                    </p>
                </div>

                <div className="benefits-grid">
                    {BENEFITS.map((b, i) => (
                        <article
                            className="benefit-card zp-reveal"
                            key={b.title}
                            style={{ transitionDelay: `${0.06 * i}s` }}
                        >
                            <span className="benefit-icon">
                                <b.Icon size={23} strokeWidth={2} aria-hidden="true" />
                            </span>
                            <h3>{b.title}</h3>
                            <p>{b.desc}</p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
};
