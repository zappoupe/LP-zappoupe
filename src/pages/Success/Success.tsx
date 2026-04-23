// src/pages/Success/Success.tsx
import { useNavigate } from 'react-router-dom';
import './Success.css';

// Ícone sofisticado de confirmação (SVG)
const SophisticatedCheckIcon = () => (
    <svg 
        width="64" 
        height="64" 
        viewBox="0 0 64 64" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="success-svg-icon"
    >
        <circle cx="32" cy="32" r="30" stroke="#89b321" strokeWidth="4"/>
        <path 
            d="M20 32L28 40L44 24" 
            stroke="#89b321" 
            strokeWidth="6" 
            strokeLinecap="round" 
            strokeLinejoin="round"
        />
    </svg>
);

export const Success = () => {
    const navigate = useNavigate();

    // Atalho para abrir o Gmail
    const handleOpenGmail = () => {
        window.open('https://mail.google.com/', '_blank');
    };

    return (
        <section className="success-section">
            <div className="success-card">
                
                <div className="success-icon-container">
                    <SophisticatedCheckIcon />
                </div>
                
                <h1 className="success-title">PAGAMENTO CONFIRMADO</h1>
                
                <p className="success-subtitle">
                    Tudo pronto! Sua assinatura do ZapPoupe<br/> foi ativada com sucesso.
                </p>
                
                <p className="success-message">
                    <strong>Enviamos um e-mail para você agora.</strong><br/>
                    Acesse o link no e-mail para criar sua senha<br/>
                    e iniciar sua jornada financeira.
                </p>
                
                <div className="success-actions-container">
                    {/* Botão Primário de Atalho */}
                    <button 
                        className="btn-success-gmail"
                        onClick={handleOpenGmail}
                    >
                        ABRIR MEU GMAIL
                    </button>
                    
                    {/* Botão Secundário de Retorno */}
                    <button 
                        className="btn-success-home"
                        onClick={() => navigate('/')}
                    >
                        Voltar para o Início
                    </button>
                </div>
                
            </div>
        </section>
    );
};