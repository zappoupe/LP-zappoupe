// src/components/Dreams/Dreams.tsx
import type { ReactNode } from 'react';
import { Plane, CreditCard, PiggyBank, Target, type LucideIcon } from 'lucide-react';
import { useReveal } from '../../hooks/useReveal';
import { WhatsAppIcon } from '../ui/WhatsAppIcon';
import { goToPlans } from '../../lib/scroll';
import './Dreams.css';

interface Dream {
    Icon: LucideIcon;
    text: ReactNode;
}

const DREAMS: Dream[] = [
    {
        Icon: Plane,
        text: (
            <>
                Imagina viajar <strong>1x a mais por ano</strong> só com o dinheiro que essa IA te
                ajuda a parar de deixar escapar.
            </>
        ),
    },
    {
        Icon: CreditCard,
        text: (
            <>
                Fechar o mês <strong>sem a fatura te assustando</strong> — porque você viu o gasto
                chegando, não depois que ele já estourou o limite.
            </>
        ),
    },
    {
        Icon: PiggyBank,
        text: (
            <>
                Ter, pela primeira vez, uma <strong>reserva de emergência de verdade</strong> — não
                a que só existe na sua cabeça.
            </>
        ),
    },
    {
        Icon: Target,
        text: (
            <>
                Chegar mais perto daquele objetivo que fica adiado todo ano:{' '}
                <strong>o carro, a entrada do apê, a faculdade dos filhos.</strong>
            </>
        ),
    },
];

export const Dreams = () => {
    const { ref, visible } = useReveal<HTMLElement>();

    return (
        <section ref={ref} className={`dreams zp-section ${visible ? 'is-visible' : ''}`}>
            <div className="zp-container">
                <div className="dreams-head zp-reveal">
                    <h2 className="zp-title">Pra onde vai o dinheiro que você não vê sumir</h2>
                    <p className="zp-sub">
                        Não é sobre cortar o cafezinho. É sobre parar de perder de vista R$ 50 aqui,
                        R$ 80 ali — e descobrir onde isso vira coisa grande.
                    </p>
                </div>

                <div className="dreams-grid">
                    {DREAMS.map((d, i) => (
                        <article
                            className="dream-card zp-reveal"
                            key={i}
                            style={{ transitionDelay: `${0.08 * i}s` }}
                        >
                            <span className="dream-icon">
                                <d.Icon size={26} strokeWidth={1.9} aria-hidden="true" />
                            </span>
                            <p>{d.text}</p>
                        </article>
                    ))}
                </div>

                <div className="dreams-cta zp-reveal">
                    <button className="zp-cta" onClick={goToPlans}>
                        <WhatsAppIcon />
                        Quero começar a economizar
                    </button>
                </div>
            </div>
        </section>
    );
};
