import { useState, useEffect } from 'react';
import ImgLogo from "../../assets/logo.png";
import './FloatingNav.css';

const SITE_LOGIN = 'https://sistema-do-usuario-production.up.railway.app/';

export const FloatingNav = () => {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 24);
        window.addEventListener('scroll', onScroll);
        onScroll();
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const toTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setMenuOpen(false);
    };
    const goTo = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        setMenuOpen(false);
    };
    const login = () => { window.location.href = SITE_LOGIN; };

    return (
        <header className={`nav ${scrolled ? 'nav--scrolled' : ''} ${menuOpen ? 'nav--open' : ''}`}>
            <div className="nav-inner">
                <button className="nav-brand" onClick={toTop} aria-label="ZapPoupe — início">
                    <img src={ImgLogo} alt="" />
                    <span>ZapPoupe</span>
                </button>

                <nav className="nav-links">
                    <button onClick={toTop}>Início</button>
                    <button onClick={() => goTo('features-section')}>Recursos</button>
                    <button onClick={() => goTo('prices-section')}>Planos</button>
                    <button onClick={() => goTo('faq-section')}>Dúvidas</button>
                </nav>

                <div className="nav-actions">
                    <button className="nav-login" onClick={login}>Entrar</button>
                    <button
                        className="nav-burger"
                        onClick={() => setMenuOpen((v) => !v)}
                        aria-label="Abrir menu"
                        aria-expanded={menuOpen}
                    >
                        <span /><span /><span />
                    </button>
                </div>
            </div>

            {/* Menu mobile */}
            <div className="nav-mobile">
                <button onClick={toTop}>Início</button>
                <button onClick={() => goTo('features-section')}>Recursos</button>
                <button onClick={() => goTo('prices-section')}>Planos</button>
                <button onClick={() => goTo('faq-section')}>Dúvidas</button>
                <button className="nav-mobile-login" onClick={login}>Entrar na conta</button>
            </div>
        </header>
    );
};
