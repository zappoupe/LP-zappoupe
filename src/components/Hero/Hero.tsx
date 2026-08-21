// src/components/Hero/Hero.tsx
import { WhatsAppDemo } from '../WhatsAppDemo/WhatsAppDemo';
import { WhatsAppIcon } from '../ui/WhatsAppIcon';
import { Stars } from '../ui/Stars';
import { HERO_TESTIMONIAL, USER_COUNT } from '../../data/socialProof';
import { goToPlans, scrollToId } from '../../lib/scroll';
import './Hero.css';

const Check = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
        <path d="M4 12l5 5L20 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const GARANTIAS = ['7 dias grátis', 'Sem cartão de crédito', 'Cancele quando quiser, sem multa'];

export const Hero = () => (
    <section className="hero">
        <div className="hero-blob hero-blob--1" aria-hidden="true" />
        <div className="hero-blob hero-blob--2" aria-hidden="true" />

        <div className="hero-inner">
            {/* ── Coluna de texto ── */}
            <div className="hero-copy">
                <span className="zp-eyebrow hero-eyebrow">
                    <span className="zp-eyebrow-dot" />
                    Funciona no seu WhatsApp · sem baixar nada
                </span>

                <h1 className="hero-title">
                    <span className="hero-bubble">&ldquo;{HERO_TESTIMONIAL.quote}&rdquo;</span>
                    <span className="hero-title-line">
                        Foi o {HERO_TESTIMONIAL.author.split(' ')[0]}.{' '}
                        <span className="hero-title-quiet">
                            Agora chegou a sua vez de economizar usando IA.
                        </span>
                    </span>
                </h1>

                <p className="hero-attrib">
                    — <strong>{HERO_TESTIMONIAL.author}</strong>, {HERO_TESTIMONIAL.role}
                    <span className="hero-attrib-note">*{HERO_TESTIMONIAL.disclaimer}</span>
                </p>

                <p className="hero-sub">
                    O ZapPoupe é uma <strong>IA que vive no seu WhatsApp</strong> e cuida do seu
                    dinheiro por você: registra o gasto, categoriza sozinho, avisa{' '}
                    <strong>antes</strong> da conta vencer e te mostra pra onde o dinheiro foi —
                    tudo em segundos, sem baixar app, sem abrir planilha e sem digitar em campo
                    nenhum.
                </p>

                <div className="hero-actions">
                    <button className="zp-cta" onClick={goToPlans}>
                        <WhatsAppIcon />
                        Testar grátis no meu WhatsApp
                    </button>
                    <button className="hero-link" onClick={() => scrollToId('demo')}>
                        Ver funcionando →
                    </button>
                </div>

                <ul className="hero-risk">
                    {GARANTIAS.map((g) => (
                        <li key={g}>
                            <span className="hero-risk-check"><Check /></span>
                            {g}
                        </li>
                    ))}
                </ul>

                <div className="hero-proof">
                    <div className="hero-avatars" aria-hidden="true">
                        {['M', 'J', 'A', 'R'].map((l) => (
                            <span key={l}>{l}</span>
                        ))}
                    </div>
                    <p>
                        <Stars size={14} />
                        <span>
                            <strong>{USER_COUNT}</strong> já organizam a grana pelo Zap
                        </span>
                    </p>
                </div>
            </div>

            {/* ── Coluna visual: demo interativa ── */}
            <div className="hero-visual" id="demo">
                <WhatsAppDemo />
            </div>
        </div>
    </section>
);
