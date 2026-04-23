// src/pages/Checkout/Checkout.tsx
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import './Checkout.css';

const stripePubKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY || '';
const supabaseFunctionsUrl = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const stripePromise = loadStripe(stripePubKey);

// --- COMPONENTE DO FORMULÁRIO DO STRIPE COM NOME, EMAIL E CELULAR ---
const StripeForm = () => {
    const stripe = useStripe();
    const elements = useElements();
    
    // Estados obrigatórios
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Função para aplicar a máscara de celular automaticamente
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '').slice(0, 11);
        if (value.length >= 3 && value.length <= 6) {
            value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
        } else if (value.length >= 7) {
            value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
        }
        setPhone(value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Trava de segurança extra
        if (!name || !email || !phone) {
            alert("Por favor, preencha todos os seus dados.");
            return;
        }
        
        if (!stripe || !elements) return;

        setIsLoading(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/sucesso`,
                receipt_email: email, // O Stripe envia o recibo para cá
                payment_method_data: {
                    billing_details: {
                        name: name,
                        email: email,
                        phone: phone,
                    }
                }
            },
        });

        if (error) {
            alert(error.message); 
        }
        setIsLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            
            {/* CAMPOS OBRIGATÓRIOS DO USUÁRIO */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#4a634d' }}>Nome Completo *</label>
                <input 
                    type="text" 
                    required 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="João da Silva"
                    style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '16px' }}
                />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#4a634d' }}>E-mail de Acesso *</label>
                <input 
                    type="email" 
                    required 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="seu@email.com"
                    style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '16px' }}
                />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
                <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#4a634d' }}>Celular (WhatsApp) *</label>
                <input 
                    type="tel" 
                    required 
                    value={phone} 
                    onChange={handlePhoneChange} 
                    placeholder="(11) 99999-9999"
                    style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '16px' }}
                />
            </div>

            <hr style={{ borderTop: '1px solid #eee', marginBottom: '10px' }} />

            {/* CAMPO DE CARTÃO/PIX DO STRIPE */}
            <PaymentElement />
            
            <button 
                type="submit" 
                className="btn-pay" 
                disabled={isLoading || !stripe || !elements}
                style={{ marginTop: '20px' }}
            >
                {isLoading ? 'A PROCESSAR...' : 'FINALIZAR ASSINATURA'}
            </button>
        </form>
    );
};

export const Checkout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    const initialData = location.state || { type: 'individual', isAnnual: true, extraMembers: 0 };
    
    const [planType] = useState<'individual' | 'family'>(initialData.type);
    const [isAnnual, setIsAnnual] = useState(initialData.isAnnual);
    const [extraMembers, setExtraMembers] = useState(initialData.extraMembers);
    const [clientSecret, setClientSecret] = useState<string>('');
    
    // Estado para dar feedback visual quando o toggle é clicado
    const [isRecalculating, setIsRecalculating] = useState(false);

    // Valores Base Atualizados
    const prices = {
        individual: { annual: 197.90, monthly: 39.90 },
        family: { annual: 397.90, monthly: 59.90 },
        extraMember: { annual: 178.80, monthly: 14.90 }
    };

    const basePrice = planType === 'individual' 
        ? (isAnnual ? prices.individual.annual : prices.individual.monthly)
        : (isAnnual ? prices.family.annual : prices.family.monthly);
        
    const extraCost = planType === 'family' 
        ? extraMembers * (isAnnual ? prices.extraMember.annual : prices.extraMember.monthly)
        : 0;

    const finalPrice = basePrice + extraCost;
    const periodText = isAnnual ? '/ANO' : '/MÊS';
    
    const title = planType === 'individual' 
        ? "PLANO INDIVIDUAL - CRESCIMENTO PESSOAL" 
        : "PLANO FAMÍLIA - PROSPERIDADE CONJUNTA";

    const benefits = planType === 'individual' 
        ? [
            "Registo de gastos por áudio, texto ou foto",
            "Categorização 100% automática pela IA",
            "Lembretes de vencimento de contas",
            "Gráficos de saúde financeira no WhatsApp"
        ]
        : [
            "Tudo do plano individual",
            "Até 3 membros incluídos (+ membros extras)",
            "Controlos familiares e individuais",
            "Categorização e relatórios familiares"
        ];

    useEffect(() => {
        const fetchClientSecret = async () => {
            if (!supabaseFunctionsUrl) return;
            
            // Ativa o aviso de carregamento sofisticado
            setIsRecalculating(true);

            try {
                const res = await fetch(`${supabaseFunctionsUrl}/checkout-session`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${supabaseAnonKey}`,
                        'apikey': supabaseAnonKey
                    },
                    body: JSON.stringify({ planType, isAnnual, extraMembers }),
                });
                
                const data = await res.json();
                
                if (data.clientSecret) {
                    setClientSecret(data.clientSecret);
                } else {
                    console.error("Erro do servidor:", data.error);
                }
            } catch (error) {
                console.error("Erro ao comunicar com o Supabase:", error);
            } finally {
                // Tira o aviso quando terminar de puxar o preço novo
                setIsRecalculating(false);
            }
        };

        fetchClientSecret();
    }, [planType, isAnnual, extraMembers]);

    return (
        <section className="checkout-section">
            <div className="checkout-container">
                <div className="checkout-summary">
                    <button className="btn-back" onClick={() => navigate('/')}>
                        ← Voltar para o início
                    </button>
                    
                    <h2 className="summary-title">Resumo do Pedido</h2>
                    <h3 className="plan-name">{title}</h3>

                    <div className="checkout-billing-toggle">
                        <span className={!isAnnual ? "active" : ""}>Mensal</span>
                        <div className="checkout-toggle-switch" onClick={() => setIsAnnual(!isAnnual)}>
                            <div className={`checkout-toggle-knob ${isAnnual ? "annual" : "monthly"}`}></div>
                        </div>
                        <span className={isAnnual ? "active" : ""}>Anual</span>
                    </div>
                    
                    <div className="plan-price">
                        R$ {finalPrice.toFixed(2).replace('.', ',')} <span>{periodText}</span>
                    </div>

                    {planType === 'family' && (
                        <div className="checkout-member-control">
                            <p>
                                <strong>Membros Extras</strong> <br/>
                                (+ R$ {isAnnual ? prices.extraMember.annual.toFixed(2).replace('.', ',') : prices.extraMember.monthly.toFixed(2).replace('.', ',')}{periodText} por pessoa)
                            </p>
                            <div className="checkout-member-counter">
                                <button onClick={() => setExtraMembers(Math.max(0, extraMembers - 1))}>-</button>
                                <span>{extraMembers}</span>
                                <button onClick={() => setExtraMembers(extraMembers + 1)}>+</button>
                            </div>
                        </div>
                    )}

                    <ul className="benefits-list">
                        {benefits.map((benefit: string, idx: number) => (
                            <li key={idx}>{benefit}</li>
                        ))}
                    </ul>
                </div>

                <div className="checkout-form-container">
                    <h2 className="checkout-title">Pagamento Seguro</h2>
                    <p className="checkout-subtitle">Preencha os dados abaixo para iniciar sua assinatura.</p>

                    {/* Lógica condicional Limpa e Sofisticada */}
                    {isRecalculating || !clientSecret ? (
                        <div className="checkout-loader-container">
                            <div className="checkout-spinner"></div>
                            <p className="checkout-loader-text">
                                {isRecalculating ? "A atualizar o valor do plano..." : "A preparar o ambiente seguro..."}
                            </p>
                        </div>
                    ) : (
                        <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
                            <StripeForm />
                        </Elements>
                    )}
                </div>
            </div>
        </section>
    );
};