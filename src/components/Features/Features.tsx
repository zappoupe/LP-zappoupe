// src/components/Features/Features.tsx
import ImgBackground from "../../assets/bg-features.png"; 
import ImgIcon1 from "../../assets/message.svg"; 
import ImgIcon2 from "../../assets/voice.svg"; 
import ImgIcon3 from "../../assets/post.svg"; 
import ImgIcon4 from "../../assets/circle.svg"; 
import ImgIcon5 from "../../assets/money.svg"; 
import "./Features.css";

export const Features = () => {
    return (
        <section className="features-section">
            <div className="features-background">
                <img src={ImgBackground} alt="Fundo orgânico" />
            </div>

            <div className="FEATURES">

                <h2 className="text-wrapper-title">CONHEÇA ALGUNS RECURSOS DO ZAPPOUPE:</h2>

                {/* --- OS 5 CARDS DE RECURSOS --- */}
                
                {/* Card 1: Mensagem */}
                <div className="features-card card-1 card-anim has-reveal">
                    <div className="card-front">
                        <img className="card-icon" alt="Icon" src={ImgIcon1} />
                    </div>
                    <div className="card-reveal">
                        <h3>Adicione seus gastos com apenas uma mensagem</h3>
                        <p>Basta mandar uma mensagem como "mercado 120 reais" e o ZapPoupe atualiza tudo sozinho, com saldo, categorias e histórico direto no seu WhatsApp.</p>
                    </div>
                </div>

                {/* Card 2: Áudio e Foto */}
                <div className="features-card card-2 card-anim has-reveal">
                    <div className="card-front">
                        <img className="card-icon" alt="Icon" src={ImgIcon2} />
                    </div>
                    <div className="card-reveal">
                        <h3>Grave um áudio ou envie uma foto</h3>
                        <p>Não quer digitar? É só mandar um áudio ou foto do comprovante. O ZapPoupe entende tudo e registra automaticamente. Você fala, ele organiza.</p>
                    </div>
                </div>

                {/* Card 3: Lembretes */}
                <div className="features-card card-3 card-anim has-reveal">
                    <div className="card-front">
                        <img className="card-icon" alt="Icon" src={ImgIcon3} />
                    </div>
                    <div className="card-reveal">
                        <h3>Lembretes que salvam o seu mês</h3>
                        <p>Nunca mais se esqueça de pagar uma conta. O assistente te avisa antes do vencimento e ainda ajuda a organizar os valores.</p>
                    </div>
                </div>

                {/* Card 4: Categorias Inteligentes */}
                <div className="features-card card-4 card-anim has-reveal">
                    <div className="card-front">
                        <img className="card-icon" alt="Icon" src={ImgIcon4} />
                    </div>
                    <div className="card-reveal">
                        <h3>Categorias inteligentes e automáticas</h3>
                        <p>O ZapPoupe reconhece automaticamente seus gastos e organiza tudo sem você precisar ajustar nada. Gastos com mercado, transporte, lazer ou boletos são reconhecidos automaticamente.</p>
                    </div>
                </div>

                {/* Card 5: Controle Total */}
                <div className="features-card card-5 card-anim has-reveal">
                    <div className="card-front">
                        <img className="card-icon" alt="Icon" src={ImgIcon5} />
                    </div>
                    <div className="card-reveal">
                        <h3>Controle total do seu dinheiro</h3>
                        <p>Veja exatamente como está gastando e onde pode economizar. Gráficos claros e categorias organizadas mostram um panorama real da sua saúde financeira. Mais clareza, mais controle e menos surpresas no fim do mês.</p>
                    </div>
                </div>

            </div>
        </section>
    );
};