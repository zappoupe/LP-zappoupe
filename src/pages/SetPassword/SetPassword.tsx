import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import './SetPassword.css';

// Inicializa o cliente do Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const SetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    
    // Novos estados para controlar a segurança da sessão
    const [isCheckingSession, setIsCheckingSession] = useState(true);
    const [hasSession, setHasSession] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const checkAuth = async () => {
            // Verifica se já existe uma sessão engatilhada
            const { data: { session } } = await supabase.auth.getSession();
            if (isMounted) {
                setHasSession(!!session);
                // Damos um pequeno delay só para evitar um "piscar" na tela
                setTimeout(() => setIsCheckingSession(false), 500);
            }
        };

        // Fica ouvindo ativamente o Supabase processar a URL
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            if (isMounted) {
                setHasSession(!!session);
                setIsCheckingSession(false);
            }
        });

        checkAuth();

        return () => {
            isMounted = false;
            authListener.subscription.unsubscribe();
        };
    }, []);

    const handleSetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Trava de segurança extra
        if (!hasSession) {
            setMessage('Sessão inválida. O link expirou.');
            return;
        }

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
            // Pega a sessão ativa para passar o token ao sistema externo
            const { data: { session } } = await supabase.auth.getSession();
            setTimeout(() => {
                if (session?.access_token && session?.refresh_token) {
                    // Redireciona já logado passando os tokens via hash (padrão Supabase)
                    window.location.href = `https://sistema-do-usuario-production.up.railway.app/#access_token=${session.access_token}&refresh_token=${session.refresh_token}&type=magiclink`;
                } else {
                    window.location.href = 'https://sistema-do-usuario-production.up.railway.app/';
                }
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

                {isCheckingSession ? (
                    <p style={{ color: '#89b321', fontWeight: 'bold', margin: '30px 0' }}>
                        Verificando seu link seguro...
                    </p>
                ) : !hasSession ? (
                    <div style={{ backgroundColor: '#ffebee', padding: '20px', borderRadius: '12px', color: '#c62828', fontSize: '14px', lineHeight: '1.5' }}>
                        <strong>O link é inválido ou expirou!</strong><br /><br />
                        Por segurança, os links de acesso só podem ser usados uma vez.<br /> Volte ao aplicativo e solicite um novo acesso.
                    </div>
                ) : isSuccess ? (
                    <div className="password-success-msg">
                        Senha criada com sucesso!<br/> Redirecionando...
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

                        {message && <p style={{ color: '#c62828', fontSize: '13px', margin: 0, fontWeight: 'bold' }}>{message}</p>}

                        <button type="submit" className="btn-save-password" disabled={isLoading}>
                            {isLoading ? 'SALVANDO...' : 'SALVAR SENHA'}
                        </button>
                    </form>
                )}
            </div>
        </section>
    );
};