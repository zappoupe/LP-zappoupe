import { useState, useEffect } from 'react';
import ImgLogo from "../../assets/logo.png";
import IconHome from "../../assets/home.svg";
import IconPrices from "../../assets/prices.svg";
import IconFaq from "../../assets/faq.svg";
import IconLogin from "../../assets/login.svg";
import './FloatingNav.css';

export const FloatingNav = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [activeSections, setActiveSections] = useState({
        prices: false,
        faq: false,
        footer: false
    });

    // Função de Scroll Suave
    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > window.innerHeight * 0.5);
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll();

        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.15 
        };

        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const id = entry.target.id;
                if (id === 'prices-section') {
                    setActiveSections(prev => ({ ...prev, prices: entry.isIntersecting }));
                } else if (id === 'faq-section') {
                    setActiveSections(prev => ({ ...prev, faq: entry.isIntersecting }));
                } else if (id === 'footer-section') {
                    setActiveSections(prev => ({ ...prev, footer: entry.isIntersecting }));
                }
            });
        }, observerOptions);

        const sections = ['prices-section', 'faq-section', 'footer-section'];
        sections.forEach(id => {
            const el = document.getElementById(id);
            if (el) sectionObserver.observe(el);
        });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            sectionObserver.disconnect();
        };
    }, []);

    const isVisible = isScrolled && !activeSections.footer;
    const isCollapsed = activeSections.prices || activeSections.faq;

    return (
        <div className={`floating-nav-container ${isVisible ? 'visible' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
            <img 
                className="nav-logo" 
                alt="Logo" 
                src={ImgLogo} 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                style={{ cursor: 'pointer' }}
            />

            <div className="nav-content">
                <div className="nav-item" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    <img className="nav-icon" alt="Início" src={IconHome} />
                    <span className="nav-text">INÍCIO</span>
                </div>
                
                <div className="nav-item" onClick={() => scrollToSection('prices-section')}>
                    <img className="nav-icon" alt="Planos" src={IconPrices} />
                    <span className="nav-text">PLANOS</span>
                </div>
                
                <div className="nav-item" onClick={() => scrollToSection('faq-section')}>
                    <img className="nav-icon" alt="Dúvidas" src={IconFaq} />
                    <span className="nav-text">DÚVIDAS FREQUENTES</span>
                </div>
            </div>

            <div className="nav-login-area">
                <div className="nav-login-btn" onClick={() => window.location.href = 'https://sistema-do-usuario-production.up.railway.app/'} style={{ cursor: 'pointer' }}>
                    <img className="login-icon" alt="Login" src={IconLogin} />
                    <span className="login-text">LOGIN</span>
                </div>
            </div>
        </div>
    );
};