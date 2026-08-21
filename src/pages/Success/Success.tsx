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

const AlertIcon = () => (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="success-svg-icon" aria-hidden="true">
        <circle cx="32" cy="32" r="30" stroke="#C4442E" strokeWidth="4" />
        <path d="M32 18v20" stroke="#C4442E" strokeWidth="6" strokeLinecap="round" />
        <circle cx="32" cy="46" r="1" fill="#C4442E" stroke="#C4442E" strokeWidth="4" />
    </svg>
);

/** "2026-09-19" -> "19/09/2026". Devolve null se vier vazio ou torto. */
const formatarData = (iso: string | null): string | null => {
    if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
    const [ano, mes, dia] = iso.split('-');
    return `${dia}/${mes}/${ano}`;
};

export const Success = () => {
    const navigate = useNavigate();
    const [params] = useSearchParams();

    /* O Asaas volta pra cá pelo successUrl que montamos no checkout-asaas, com
       o método e a data do fim do trial. (O fluxo antigo do Stripe lia
       redirect_status, que não existe mais.) Quando o cliente desiste, o
       cancelUrl leva de volta pro /checkout — não passa por aqui. */
    const metodo = params.get('metodo');
    const vencimento = formatarData(params.get('venc'));

    /* Rede de segurança: se algum dia o gateway devolver um erro na query,
       não anunciamos sucesso por cima dele. */
    const falhou = params.get('erro') === '1' || params.get('status') === 'failed';

    const goToAccount = () => { window.location.href = SITE_LOGIN; };

    if (falhou) {
        return (
            <section className="success-section">
                <div className="success-card">
                    <div className="success-icon-container"><AlertIcon /></div>
                    <h1 className="success-title success-title--error">PAGAMENTO NÃO CONCLUÍDO</h1>
                    <p className="success-subtitle">
                        Não conseguimos concluir a operação, então a assinatura ainda
                        <br />não foi ativada.
                    </p>
                    <p className="success-message">
                        <strong>Você não foi cobrado.</strong><br />
                        Pode tentar de novo — leva menos de um minuto.
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

    if (metodo === 'pix') {
        return (
            <section className="success-section">
                <div className="success-card">
                    <div className="success-icon-container"><CheckIcon /></div>

                    <h1 className="success-title">TUDO CERTO!</h1>

                    <p className="success-subtitle">
                        Seus 7 dias grátis do ZapPoupe<br />começaram agora.
                    </p>

                    <p className="success-message">
                        <strong>Nada foi cobrado hoje.</strong><br />
                        {vencimento
                            ? <>Em <strong>{vencimento}</strong> você recebe um PIX por e-mail<br />para continuar usando.</>
                            : <>Ao final dos 7 dias você recebe um PIX<br />por e-mail para continuar usando.</>}
                    </p>

                    <p className="success-message">
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
    }

    return (
        <section className="success-section">
            <div className="success-card">
                <div className="success-icon-container"><CheckIcon /></div>

                <h1 className="success-title">TUDO CERTO!</h1>

                <p className="success-subtitle">
                    Seus 7 dias grátis do ZapPoupe<br />começaram agora.
                </p>

                <p className="success-message">
                    <strong>Nada foi cobrado hoje.</strong><br />
                    {vencimento
                        ? <>A primeira cobrança acontece em <strong>{vencimento}</strong>,<br />no cartão que você cadastrou.</>
                        : <>A primeira cobrança acontece só<br />depois dos 7 dias de teste.</>}
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
