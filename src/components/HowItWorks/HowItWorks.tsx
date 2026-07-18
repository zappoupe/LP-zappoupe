// src/components/HowItWorks/HowItWorks.tsx
import { useReveal } from '../../hooks/useReveal';
import { WhatsAppIcon } from '../ui/WhatsAppIcon';
import { goToPlans } from '../../lib/scroll';
import './HowItWorks.css';

const STEPS = [
    {
        title: 'Salve o contato',
        desc: 'Toque no botão verde e o ZapPoupe abre direto no seu WhatsApp. Pronto, vocês já se conhecem.',
    },
    {
        title: 'Mande seu primeiro gasto',
        desc: 'Do jeito que sair: "gastei 50 no mercado", um áudio no trânsito ou a foto da notinha.',
    },
    {
        title: 'Receba seu resumo',
        desc: 'Saldo atualizado, categorias organizadas e alertas de contas — tudo chegando na mesma conversa.',
    },
];

export const HowItWorks = () => {
    const { ref, visible } = useReveal<HTMLElement>();

    return (
        <section
            ref={ref}
            id="como-funciona"
            className={`hiw zp-section ${visible ? 'is-visible' : ''}`}
        >
            <div className="zp-container">
                <div className="hiw-head zp-reveal">
                    <span className="zp-eyebrow">
                        <span className="zp-eyebrow-dot" />
                        02 — COMO FUNCIONA
                    </span>
                    <h2 className="zp-title">Começar leva menos de 1 minuto</h2>
                    <p className="zp-sub">
                        Sem cadastro, sem formulário, sem tutorial. Se você sabe mandar mensagem no
                        WhatsApp, você já sabe usar o ZapPoupe.
                    </p>
                </div>

                <ol className="hiw-steps">
                    {STEPS.map((s, i) => (
                        <li
                            className="hiw-step zp-reveal"
                            key={s.title}
                            style={{ transitionDelay: `${0.1 * i}s` }}
                        >
                            <span className="hiw-num" aria-hidden="true">{i + 1}</span>
                            <h3>{s.title}</h3>
                            <p>{s.desc}</p>
                        </li>
                    ))}
                </ol>

                <div className="hiw-cta zp-reveal">
                    <button className="zp-cta" onClick={goToPlans}>
                        <WhatsAppIcon />
                        Quero começar agora
                    </button>
                </div>
            </div>
        </section>
    );
};
