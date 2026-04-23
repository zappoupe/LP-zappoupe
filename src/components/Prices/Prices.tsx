// src/components/Prices/Prices.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BgPrices from "../../assets/bg-prices.png"; 
import ImgIndividual from "../../assets/strong.svg"; 
import ImgFamily from "../../assets/family.svg"; 
import "./Prices.css";

export const Prices = () => {
    const navigate = useNavigate();
    
    // Estados para controlar o ciclo de cobrança e membros extras
    const [isAnnual, setIsAnnual] = useState(true);
    const [extraMembers, setExtraMembers] = useState(0);

    // Valores Base Atualizados
    const prices = {
        individual: { annual: 197.90, monthly: 39.90 },
        family: { annual: 397.90, monthly: 59.90 },
        extraMember: { annual: 178.80, monthly: 14.90 } // 14.90 * 12 = 178.80
    };

    // Nova função enxuta: Manda apenas as escolhas do usuário para o Checkout calcular!
    const handleSubscribe = (planType: 'individual' | 'family') => {
        navigate('/checkout', { 
            state: { 
                type: planType, 
                isAnnual: isAnnual, 
                extraMembers: planType === 'family' ? extraMembers : 0
            } 
        });
    };

    return (
        <section className="prices-section" id="prices-section">
            <div className="prices-background">
                <img src={BgPrices} alt="Fundo Abstrato" />
            </div>

            <div className="prices-content">
                <h2 className="prices-title card-anim-1">ESCOLHA O PLANO CERTO PARA VOCÊ E SEU DINHEIRO</h2>

                {/* --- TOGGLE MENSAL / ANUAL --- */}
                <div className="billing-toggle card-anim-1">
                    <span className={!isAnnual ? "active" : ""}>Mensal</span>
                    <div className="toggle-switch" onClick={() => setIsAnnual(!isAnnual)}>
                        <div className={`toggle-knob ${isAnnual ? "annual" : "monthly"}`}></div>
                    </div>
                    <span className={isAnnual ? "active" : ""}>Anual <span className="discount-badge">-20%</span></span>
                </div>

                <div className="pricing-cards-container">
                    
                    {/* --- CARD 1: INDIVIDUAL --- */}
                    <div className="price-card card-anim-2">
                        <img className="card-illustration" alt="Plano Individual" src={ImgIndividual} />
                        <h3 className="card-subtitle">PLANO INDIVIDUAL - CRESCIMENTO PESSOAL</h3>
                        
                        <div className="price-block">
                            <span className="currency">R$</span>
                            <span className="amount">
                                {isAnnual ? prices.individual.annual.toFixed(2).replace('.', ',') : prices.individual.monthly.toFixed(2).replace('.', ',')}
                            </span>
                            <span className="period">{isAnnual ? '/ANO' : '/MÊS'}</span>
                        </div>
                        {isAnnual && <p className="monthly-equivalent">equivalente a R$ {(prices.individual.annual / 12).toFixed(2).replace('.', ',')} /mês</p>}
                        
                        <ul className="features-list">
                            <li>Registro de gastos por áudio, texto ou foto</li>
                            <li>Categorização 100% automática pela IA</li>
                            <li>Lembretes de vencimento de contas</li>
                            <li>Gráficos de saúde financeira no WhatsApp</li>
                        </ul>
                        
                        <button className="btn-subscribe" onClick={() => handleSubscribe('individual')}>
                            ASSINAR INDIVIDUAL
                        </button>
                    </div>

                    {/* --- CARD 2: FAMÍLIA --- */}
                    <div className="price-card card-anim-3">
                        <img className="card-illustration" alt="Plano Família" src={ImgFamily} />
                        <h3 className="card-subtitle">PLANO FAMÍLIA - PROSPERIDADE CONJUNTA</h3>
                        
                        <div className="price-block">
                            <span className="currency">R$</span>
                            <span className="amount">
                                {isAnnual ? prices.family.annual.toFixed(2).replace('.', ',') : prices.family.monthly.toFixed(2).replace('.', ',')}
                            </span>
                            <span className="period">{isAnnual ? '/ANO' : '/MÊS'}</span>
                        </div>
                        {isAnnual && <p className="monthly-equivalent">equivalente a R$ {(prices.family.annual / 12).toFixed(2).replace('.', ',')} /mês</p>}
                        
                        <ul className="features-list">
                            <li>Tudo do plano individual</li>
                            <li>Até 3 membros incluídos</li>
                            <li>Controles familiares e individuais</li>
                            <li>Categorização e relatórios familiares</li>
                        </ul>

                        {/* --- CONTADOR DE MEMBROS EXTRAS --- */}
                        <div className="extra-member-box">
                            <p className="extra-title"><strong>MEMBROS EXTRAS</strong> (opcional)</p>
                            <div className="member-counter">
                                <button onClick={() => setExtraMembers(Math.max(0, extraMembers - 1))}>-</button>
                                <span>{extraMembers}</span>
                                <button onClick={() => setExtraMembers(extraMembers + 1)}>+</button>
                            </div>
                            <p className="extra-price">+ R$ {isAnnual ? prices.extraMember.annual.toFixed(2).replace('.', ',') : prices.extraMember.monthly.toFixed(2).replace('.', ',')} {isAnnual ? '/ano' : '/mês'} por membro</p>
                        </div>
                        
                        <button className="btn-subscribe" onClick={() => handleSubscribe('family')}>
                            ASSINAR FAMÍLIA
                        </button>
                    </div>

                </div>
            </div>
        </section>
    );
};