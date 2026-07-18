// src/pages/Checkout/Checkout.tsx
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import './Checkout.css';

const stripePubKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY || '';
const supabaseFunctionsUrl = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const stripePromise = loadStripe(stripePubKey);

type PaymentMode = 'setup' | 'payment';

const Check = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const LockIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="4" y="10" width="16" height="11" rx="2.5" stroke="currentColor" strokeWidth="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

interface StripeFormProps {
    name: string;
    email: string;
    phone: string;
    mode: PaymentMode;
}

const StripeForm = ({ name, email, phone, mode }: StripeFormProps) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setIsLoading(true);

        const confirmParams = {
            return_url: `${window.location.origin}/sucesso`,
            payment_method_data: {
                billing_details: { name, email, phone }
            }
        };

        const { error } = mode === 'setup'
            ? await stripe.confirmSetup({ elements, confirmParams })
            : await stripe.confirmPayment({ elements, confirmParams: { ...confirmParams, receipt_email: email } });

        if (error) {
            alert(error.message);
        }
        setIsLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="co-form">
            <PaymentElement />
            <button type="submit" className="co-submit" disabled={isLoading || !stripe || !elements}>
                {isLoading ? 'PROCESSANDO...' : 'INICIAR 30 DIAS GRÁTIS'}
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

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [clientSecret, setClientSecret] = useState<string>('');
    const [mode, setMode] = useState<PaymentMode>('setup');
    const [isCreatingSession, setIsCreatingSession] = useState(false);
    const [sessionError, setSessionError] = useState('');

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
    const periodText = isAnnual ? '/ano' : '/mês';

    const planName = planType === 'individual' ? 'Individual' : 'Família';
    const planTagline = planType === 'individual' ? 'Crescimento pessoal' : 'Prosperidade conjunta';

    const benefits = planType === 'individual'
        ? [
            "Registro de gastos por áudio, texto ou foto",
            "Categorização 100% automática pela IA",
            "Lembretes de vencimento de contas",
            "Gráficos de saúde financeira no WhatsApp"
        ]
        : [
            "Tudo do plano Individual",
            "Até 3 membros incluídos (+ membros extras)",
            "Controles familiares e individuais separados",
            "Relatórios da família inteira"
        ];

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '').slice(0, 11);
        if (value.length >= 3 && value.length <= 6) {
            value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
        } else if (value.length >= 7) {
            value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
        }
        setPhone(value);
    };

    const handleContinue = async (e: React.FormEvent) => {
        e.preventDefault();
        setSessionError('');

        if (!name.trim() || !email.trim() || !phone.trim()) {
            setSessionError('Preencha nome, e-mail e celular antes de continuar.');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            setSessionError('E-mail inválido.');
            return;
        }
        if (password.length < 6) {
            setSessionError('A senha deve ter pelo menos 6 caracteres.');
            return;
        }
        if (password !== confirmPassword) {
            setSessionError('As senhas não coincidem.');
            return;
        }
        if (!supabaseFunctionsUrl) {
            setSessionError('Configuração inválida. Tente novamente em alguns minutos.');
            return;
        }

        setIsCreatingSession(true);

        try {
            const res = await fetch(`${supabaseFunctionsUrl}/checkout-session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${supabaseAnonKey}`,
                    'apikey': supabaseAnonKey
                },
                body: JSON.stringify({
                    planType,
                    isAnnual,
                    extraMembers,
                    email: email.trim().toLowerCase(),
                    name: name.trim(),
                    phone: phone.trim(),
                    password,
                }),
            });

            const data = await res.json();

            if (data.clientSecret) {
                setClientSecret(data.clientSecret);
                setMode(data.mode || 'setup');
            } else {
                setSessionError(data.error || 'Não foi possível iniciar o pagamento.');
            }
        } catch {
            setSessionError('Erro de comunicação. Verifique sua conexão e tente novamente.');
        } finally {
            setIsCreatingSession(false);
        }
    };

    const fmt = (v: number) => v.toFixed(2).replace('.', ',');

    return (
        <section className="checkout-section">
            <div className="checkout-card">

                {/* ── RESUMO (esquerda) ── */}
                <aside className="co-summary">
                    <div className="co-summary-glow" aria-hidden="true" />

                    <button className="co-back" onClick={() => navigate('/')}>← Voltar para o início</button>

                    <span className="co-summary-eyebrow">RESUMO DO PEDIDO</span>
                    <div className="co-plan">
                        <h2>{planName}</h2>
                        <p>{planTagline}</p>
                    </div>

                    <div className="co-trial">
                        <span className="co-trial-badge">
                            <Sparkles size={14} strokeWidth={2.2} aria-hidden="true" />
                            30 DIAS GRÁTIS
                        </span>
                        <p>Você não será cobrado hoje. A primeira cobrança acontece apenas após os 30 dias de teste — cancele quando quiser.</p>
                    </div>

                    <div className="co-toggle">
                        <span className={!isAnnual ? "active" : ""}>Mensal</span>
                        <button
                            className="co-toggle-switch"
                            onClick={() => !clientSecret && setIsAnnual(!isAnnual)}
                            aria-label="Alternar mensal/anual"
                        >
                            <span className={`co-toggle-knob ${isAnnual ? "annual" : "monthly"}`} />
                        </button>
                        <span className={isAnnual ? "active" : ""}>Anual</span>
                    </div>

                    <div className="co-price">
                        <span className="co-price-currency">R$</span>
                        <span className="co-price-amount">{fmt(finalPrice)}</span>
                        <span className="co-price-period">{periodText}</span>
                    </div>

                    {planType === 'family' && (
                        <div className="co-members">
                            <div className="co-members-info">
                                <strong>Membros extras</strong>
                                <span>+ R$ {isAnnual ? fmt(prices.extraMember.annual) : fmt(prices.extraMember.monthly)} {periodText} por pessoa</span>
                            </div>
                            <div className="co-members-counter">
                                <button onClick={() => !clientSecret && setExtraMembers(Math.max(0, extraMembers - 1))} aria-label="Remover">−</button>
                                <span>{extraMembers}</span>
                                <button onClick={() => !clientSecret && setExtraMembers(extraMembers + 1)} aria-label="Adicionar">+</button>
                            </div>
                        </div>
                    )}

                    <ul className="co-benefits">
                        {benefits.map((b, i) => (
                            <li key={i}><span className="co-benefit-check"><Check /></span>{b}</li>
                        ))}
                    </ul>
                </aside>

                {/* ── FORM (direita) ── */}
                <div className="co-form-wrap">
                    <div className="co-form-head">
                        <h1>
                            <span className="co-lock"><LockIcon /></span>
                            Pagamento Seguro
                        </h1>
                        <p>
                            {clientSecret
                                ? 'Adicione os dados do cartão para iniciar seus 30 dias grátis.'
                                : 'Preencha seus dados para iniciar sua assinatura.'}
                        </p>
                    </div>

                    {!clientSecret ? (
                        <form onSubmit={handleContinue} className="co-form">
                            <div className="co-field">
                                <label>Nome completo *</label>
                                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="João da Silva" />
                            </div>

                            <div className="co-field">
                                <label>E-mail de acesso *</label>
                                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" />
                            </div>

                            <div className="co-field">
                                <label>Celular (WhatsApp) *</label>
                                <input type="tel" required value={phone} onChange={handlePhoneChange} placeholder="(11) 99999-9999" />
                            </div>

                            <div className="co-field-row">
                                <div className="co-field">
                                    <label>Crie sua senha *</label>
                                    <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" autoComplete="new-password" />
                                </div>
                                <div className="co-field">
                                    <label>Confirme sua senha *</label>
                                    <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repita a senha" autoComplete="new-password" />
                                </div>
                            </div>

                            {sessionError && <p className="co-error">{sessionError}</p>}

                            <button type="submit" className="co-submit" disabled={isCreatingSession}>
                                {isCreatingSession ? 'PREPARANDO...' : 'CONTINUAR PARA O PAGAMENTO'}
                            </button>

                            <p className="co-secure-note"><LockIcon /> Seus dados são protegidos e o pagamento é processado pela Stripe.</p>
                        </form>
                    ) : (
                        <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
                            <StripeForm name={name} email={email} phone={phone} mode={mode} />
                        </Elements>
                    )}
                </div>
            </div>
        </section>
    );
};
