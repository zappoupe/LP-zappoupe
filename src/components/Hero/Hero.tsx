// src/components/Hero/Hero.tsx
import ImgBackground from "../../assets/bg-hero.png"; 
import ImgMoca from "../../assets/Objeto.png";
import "./Hero.css";

export const Hero = () => {
    // Função para rolar até a seção de preços
    const scrollToPrices = () => {
        const element = document.getElementById('prices-section');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <section className="hero-section">
            <div className="hero-background">
                <img src={ImgBackground} alt="Fundo orgânico" />
            </div>

            <div className="HERO">
                {/* Adicionamos o onClick aqui! */}
                <div className="frame" onClick={scrollToPrices}>
                    <div className="text-wrapper">COMEÇAR MEU CONTROLE AGORA</div>
                </div>

                <div className="div">
                    <div className="frame-wrapper">
                        <div className="frame-2">
                            <p className="p">VOCÊ FALA, O ZAPPOUPE ENTENDE.</p>
                            <div className="text-wrapper-2">FINALMENTE <br/> SE ORGANIZA.</div>
                            <div className="text-wrapper-3">SUA GRANA</div>
                        </div>
                    </div>
                    <div className="div-wrapper">
                        <div className="frame-3">
                            <p className="text-wrapper-4">
                                Se o dinheiro sempre some, o ZapPoupe te mostra o caminho de volta ao controle.
                            </p>
                        </div>
                    </div>
                </div>

                <img className="objeto" alt="Objeto" src={ImgMoca} />
            </div>
        </section>
    );
};