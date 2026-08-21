// src/pages/Checkout/Checkout.tsx
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import './Checkout.css';

const supabaseFunctionsUrl = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

type Metodo = 'CREDIT_CARD' | 'PIX';

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

const CardIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="2" y="5" width="20" height="14" rx="2.5" stroke="currentColor" strokeWidth="2" />
        <path d="M2 10h20" stroke="currentColor" strokeWidth="2" />
    </svg>
);

const PixIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 3.2 20.8 12 12 20.8 3.2 12z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M8.4 8.4 12 12l3.6-3.6M8.4 15.6 12 12l3.6 3.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

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
    const [cpf, setCpf] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [metodo, setMetodo] = useState<Metodo>('CREDIT_CARD');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [sessionError, setSessionError] = useState('');

    /* Os valores abaixo são só para exibição. Quem calcula o que será cobrado
       é a Edge Function, a partir do plano — nunca este arquivo. Editar o
       preço aqui no devtools não muda um centavo da cobrança. */
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

    const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const d = e.target.value.replace(/\D/g, '').slice(0, 11);
        let value = d;
        if (d.length > 9) value = `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
        else if (d.length > 6) value = `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
        else if (d.length > 3) value = `${d.slice(0, 3)}.${d.slice(3)}`;
        setCpf(value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
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
        if (phone.replace(/\D/g, '').length < 10) {
            setSessionError('Celular inválido. Informe DDD + número.');
            return;
        }
        /* No cartão, o CPF é pedido pelo Asaas na página de pagamento.
           No PIX somos nós que criamos o cliente lá, então precisa vir daqui. */
        if (metodo === 'PIX' && cpf.replace(/\D/g, '').length !== 11) {
            setSessionError('Informe um CPF válido para pagar com PIX.');
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

        setIsSubmitting(true);

        try {
            const res = await fetch(`${supabaseFunctionsUrl}/checkout-asaas`, {
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
                    cpfCnpj: cpf.replace(/\D/g, ''),
                    password,
                    metodo,
                }),
            });

            const data = await res.json();

            if (data.redirectUrl) {
                /* Daqui em diante quem manda é o Asaas: no cartão é a página
                   de checkout dele, no PIX é a fatura com o QR Code. A conta
                   só é liberada quando o webhook confirma. */
                window.location.href = data.redirectUrl;
                return;
            }

            setSessionError(data.error || 'Não foi possível iniciar o pagamento.');
        } catch {
            setSessionError('Erro de comunicação. Verifique sua conexão e tente novamente.');
        } finally {
            setIsSubmitting(false);
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
                            7 DIAS GRÁTIS
                        </span>
                        <p>Você não será cobrado hoje. A primeira cobrança acontece apenas após os 7 dias de teste — cancele quando quiser.</p>
                    </div>

                    <div className="co-toggle">
                        <span className={!isAnnual ? "active" : ""}>Mensal</span>
                        <button
                            className="co-toggle-switch"
                            onClick={() => setIsAnnual(!isAnnual)}
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
                                <button onClick={() => setExtraMembers(Math.max(0, extraMembers - 1))} aria-label="Remover">−</button>
                                <span>{extraMembers}</span>
                                <button onClick={() => setExtraMembers(extraMembers + 1)} aria-label="Adicionar">+</button>
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
                        <p>Preencha seus dados para iniciar sua assinatura.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="co-form">
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

                        <div className="co-field">
                            <label>Como você prefere pagar? *</label>
                            <div className="co-metodos" role="radiogroup" aria-label="Forma de pagamento">
                                <button
                                    type="button"
                                    role="radio"
                                    aria-checked={metodo === 'CREDIT_CARD'}
                                    className={`co-metodo ${metodo === 'CREDIT_CARD' ? 'active' : ''}`}
                                    onClick={() => setMetodo('CREDIT_CARD')}
                                >
                                    <CardIcon />
                                    <strong>Cartão de crédito</strong>
                                    <span>Renova sozinho</span>
                                </button>
                                <button
                                    type="button"
                                    role="radio"
                                    aria-checked={metodo === 'PIX'}
                                    className={`co-metodo ${metodo === 'PIX' ? 'active' : ''}`}
                                    onClick={() => setMetodo('PIX')}
                                >
                                    <PixIcon />
                                    <strong>PIX</strong>
                                    <span>Você paga a cada ciclo</span>
                                </button>
                            </div>
                        </div>

                        {metodo === 'PIX' && (
                            <div className="co-field">
                                <label>CPF *</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    required
                                    value={cpf}
                                    onChange={handleCpfChange}
                                    placeholder="000.000.000-00"
                                />
                                <span className="co-hint">
                                    Ao final dos 7 dias você recebe um PIX de R$ {fmt(finalPrice)} para renovar.
                                </span>
                            </div>
                        )}

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

                        <button type="submit" className="co-submit" disabled={isSubmitting}>
                            {isSubmitting ? 'PREPARANDO...' : 'CONTINUAR PARA O PAGAMENTO'}
                        </button>

                        <p className="co-secure-note">
                            <LockIcon /> Seus dados são protegidos e o pagamento é processado pelo Asaas.
                        </p>
                    </form>
                </div>
            </div>
        </section>
    );
};
