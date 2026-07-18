// src/pages/Success/Success.tsx
import { useNavigate, useSearchParams } from 'react-router-dom';
import './Success.css';

const SITE_LOGIN = 'https://sistema-do-usuario-production.up.railway.app/';

const CheckIcon = () => (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="success-svg-icon" aria-hidden="true">
        <circle cx="32" cy="32" r="30" stroke="#89b321" strokeWidth="4" />
        <path d="M20 32L28 40L44 24" stroke="#89b321" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const ClockIcon = () => (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="success-svg-icon" aria-hidden="true">
        <circle cx="32" cy="32" r="30" stroke="#C9922B" strokeWidth="4" />
        <path d="M32 17v16l11 7" stroke="#C9922B" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const AlertIcon = () => (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="success-svg-icon" aria-hidden="true">
        <circle cx="32" cy="32" r="30" stroke="#C4442E" strokeWidth="4" />
        <path d="M32 18v20" stroke="#C4442E" strokeWidth="6" strokeLinecap="round" />
        <circle cx="32" cy="46" r="1" fill="#C4442E" stroke="#C4442E" strokeWidth="4" />
    </svg>
);

export const Success = () => {
    const navigate = useNavigate();
    const [params] = useSearchParams();

    /* O Stripe redireciona pra cá acrescentando redirect_status. Sem ler esse
       parâmetro a página anunciava "PAGAMENTO CONFIRMADO" mesmo quando o
       cartão era recusado no 3DS. Quando não há parâmetro (visita direta),
       mantemos o estado de sucesso, que é o caminho normal pós-checkout. */
    const status = params.get('redirect_status');
    const failed = status === 'failed' || status === 'requires_payment_method';
    const processing = status === 'processing';

    const goToAccount = () => { window.location.href = SITE_LOGIN; };

    if (failed) {
        return (
            <section className="success-section">
                <div className="success-card">
                    <div className="success-icon-container"><AlertIcon /></div>
                    <h1 className="success-title success-title--error">PAGAMENTO NÃO CONCLUÍDO</h1>
                    <p className="success-subtitle">
                        Não conseguimos confirmar o seu cartão, então a assinatura ainda
                        <br />não foi ativada.
                    </p>
                    <p className="success-message">
                        <strong>Você não foi cobrado.</strong><br />
                        Pode tentar de novo com outro cartão — leva menos de um minuto.
                    </p>
                    <div className="success-actions-container">
                        <button className="btn-success-gmail" onClick={() => navigate('/checkout')}>
                            TENTAR NOVAMENTE
                        </button>
                        <button className="btn-success-home" onClick={() => navigate('/')}>
                            Voltar para o Início
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    if (processing) {
        return (
            <section className="success-section">
                <div className="success-card">
                    <div className="success-icon-container"><ClockIcon /></div>
                    <h1 className="success-title success-title--pending">PAGAMENTO EM ANÁLISE</h1>
                    <p className="success-subtitle">
                        Seu banco ainda está confirmando a operação.
                        <br />Isso costuma levar alguns minutos.
                    </p>
                    <p className="success-message">
                        Assim que for aprovado, sua conta é liberada automaticamente
                        e você recebe a confirmação por e-mail.
                    </p>
                    <div className="success-actions-container">
                        <button className="btn-success-gmail" onClick={goToAccount}>
                            ACESSAR MINHA CONTA
                        </button>
                        <button className="btn-success-home" onClick={() => navigate('/')}>
                            Voltar para o Início
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="success-section">
            <div className="success-card">
                <div className="success-icon-container"><CheckIcon /></div>

                <h1 className="success-title">TUDO CERTO!</h1>

                <p className="success-subtitle">
                    Seus 30 dias grátis do ZapPoupe<br />começaram agora.
                </p>

                <p className="success-message">
                    <strong>Sua conta já está criada!</strong><br />
                    Entre com o e-mail e a senha que você<br />
                    acabou de cadastrar para começar.
                </p>

                <div className="success-actions-container">
                    <button className="btn-success-gmail" onClick={goToAccount}>
                        ACESSAR MINHA CONTA
                    </button>
                    <button className="btn-success-home" onClick={() => navigate('/')}>
                        Voltar para o Início
                    </button>
                </div>
            </div>
        </section>
    );
};
