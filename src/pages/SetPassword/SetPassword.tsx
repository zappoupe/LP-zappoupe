import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import './SetPassword.css';

// Inicializa o cliente do Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const SetPassword = () => {
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    // Quando o usuário clica no link do e-mail, o Supabase passa um token na URL (#access_token)
    // O supabase-js captura isso sozinho, então já teremos a sessão ativa.
    
    const handleSetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (password.length < 6) {
            setMessage('A senha deve ter pelo menos 6 caracteres.');
            return;
        }
        if (password !== confirmPassword) {
            setMessage('As senhas não coincidem.');
            return;
        }

        setIsLoading(true);
        setMessage('');

        // Atualiza a senha do usuário autenticado no momento
        const { error } = await supabase.auth.updateUser({
            password: password
        });

        if (error) {
            setMessage('Erro ao salvar senha: ' + error.message);
        } else {
            setIsSuccess(true);
            // Depois de 3 segundos, joga o cara pra home ou pro Dashboard real do seu app
            setTimeout(() => {
                navigate('/'); 
            }, 3000);
        }
        
        setIsLoading(false);
    };

    return (
        <section className="set-password-section">
            <div className="set-password-card">
                <h1 className="set-password-title">Crie sua Senha</h1>
                <p className="set-password-subtitle">
                    Defina uma senha segura para acessar sua conta no ZapPoupe.
                </p>

                {isSuccess ? (
                    <div className="password-success-msg">
                        🎉 Senha criada com sucesso!<br/> Redirecionando...
                    </div>
                ) : (
                    <form className="set-password-form" onSubmit={handleSetPassword}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#4a634d' }}>Nova Senha</label>
                            <input 
                                type="password" 
                                required 
                                className="set-password-input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="******"
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#4a634d' }}>Confirmar Senha</label>
                            <input 
                                type="password" 
                                required 
                                className="set-password-input"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="******"
                            />
                        </div>

                        {message && <p style={{ color: 'red', fontSize: '13px', margin: 0 }}>{message}</p>}

                        <button type="submit" className="btn-save-password" disabled={isLoading}>
                            {isLoading ? 'SALVANDO...' : 'SALVAR SENHA'}
                        </button>
                    </form>
                )}
            </div>
        </section>
    );
};