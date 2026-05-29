// src/components/Hero/Hero.tsx
import ImgMoca from "../../assets/Objeto.png";
import IconVoice from "../../assets/voice.svg";
import IconMessage from "../../assets/message.svg";
import IconMobile from "../../assets/mobile.svg";
import "./Hero.css";

export const Hero = () => {
    const scrollToPrices = () => {
        const element = document.getElementById('prices-section');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <section className="hero-section">
            {/* Blobs orgânicos de fundo */}
            <div className="hero-blob hero-blob--1" aria-hidden="true" />
            <div className="hero-blob hero-blob--2" aria-hidden="true" />

            <div className="hero-inner">
                {/* ── COLUNA DE TEXTO ── */}
                <div className="hero-copy">
                    <span className="hero-badge">
                        <span className="hero-badge-dot" />
                        VOCÊ FALA, O ZAPPOUPE ENTENDE.
                    </span>

                    <h1 className="hero-title">
                        <span className="hero-title-lead">SUA GRANA</span>
                        FINALMENTE<br />SE ORGANIZA.
                    </h1>

                    <p className="hero-sub">
                        Se o dinheiro sempre some, o ZapPoupe te mostra o caminho de volta ao controle.
                    </p>

                    <div className="hero-actions">
                        <button className="hero-cta" onClick={scrollToPrices}>
                            COMEÇAR MEU CONTROLE AGORA
                        </button>
                        <span className="hero-trust">
                            ✓ 30 dias grátis · cancele quando quiser
                        </span>
                    </div>

                    {/* Chips dos modos de registro */}
                    <div className="hero-modes">
                        <span className="hero-mode"><img src={IconVoice} alt="" /> Áudio</span>
                        <span className="hero-mode"><img src={IconMessage} alt="" /> Texto</span>
                        <span className="hero-mode"><img src={IconMobile} alt="" /> Foto</span>
                    </div>
                </div>

                {/* ── COLUNA VISUAL ── */}
                <div className="hero-visual">
                    <div className="hero-visual-glow" aria-hidden="true" />
                    <img className="hero-img" alt="Pessoa usando o ZapPoupe" src={ImgMoca} />

                    {/* Bubble do usuário */}
                    <div className="hero-chat hero-chat--user">
                        Gastei 50 no mercado 🛒
                    </div>

                    {/* Bubble do bot */}
                    <div className="hero-chat hero-chat--bot">
                        <span className="hero-chat-check">✓</span>
                        Despesa registrada! Categoria: Alimentação
                    </div>
                </div>
            </div>
        </section>
    );
};
