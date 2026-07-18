// src/components/Testimonials/Testimonials.tsx
import { useReveal } from '../../hooks/useReveal';
import { Stars } from '../ui/Stars';
import { TESTIMONIALS } from '../../data/socialProof';
import './Testimonials.css';

export const Testimonials = () => {
    const { ref, visible } = useReveal<HTMLElement>();

    if (!TESTIMONIALS.length) return null;

    return (
        <section ref={ref} className={`tst zp-section ${visible ? 'is-visible' : ''}`}>
            <div className="zp-container">
                <div className="tst-head zp-reveal">
                    <h2 className="zp-title">Quem usa, não volta pra planilha</h2>
                    <p className="zp-sub">
                        Resultados reais de quem trocou a linha 47 da planilha por uma mensagem no
                        Zap.
                    </p>
                </div>

                <div className="tst-grid">
                    {TESTIMONIALS.map((t, i) => (
                        <figure
                            className="tst-card zp-reveal"
                            key={t.name}
                            style={{ transitionDelay: `${0.08 * i}s` }}
                        >
                            {/* Aspas decorativas — puramente visual */}
                            <span className="tst-mark" aria-hidden="true">&ldquo;</span>

                            <Stars />
                            <blockquote>{t.quote}</blockquote>

                            <figcaption className="tst-who">
                                <span className="tst-av" aria-hidden="true">{t.initials}</span>
                                <span className="tst-id">
                                    <strong>{t.name}</strong>
                                    <span className="tst-loc">{t.location}</span>
                                </span>
                            </figcaption>
                        </figure>
                    ))}
                </div>
            </div>
        </section>
    );
};
