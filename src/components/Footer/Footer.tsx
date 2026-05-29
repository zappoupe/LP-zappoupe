import { Link } from "react-router-dom";
import ImgLogo from "../../assets/logo-branca.png";
import IconInstagram from "../../assets/icon-instagram.svg";
import "./Footer.css";

export const Footer = () => {
    const scrollToSection = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <footer className="footer-section" id="footer-section">
            <div className="footer-glow" aria-hidden="true" />

            <div className="footer-content">
                <div className="footer-top">
                    <div className="footer-brand">
                        <img className="footer-logo" alt="ZapPoupe" src={ImgLogo} />
                        <p className="footer-tagline">
                            Controle financeiro inteligente, direto no seu WhatsApp.
                        </p>
                        <a
                            className="footer-social"
                            href="https://www.instagram.com/zappoupe?igsh=MTkybWtiaXR4ZnV3ZA=="
                            target="_blank"
                            rel="noreferrer"
                        >
                            <img src={IconInstagram} alt="" />
                            <span>@Zappoupe</span>
                        </a>
                    </div>

                    <div className="footer-cols">
                        <div className="footer-col">
                            <h4>Institucional</h4>
                            <ul>
                                <li><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Início</button></li>
                                <li><button onClick={() => scrollToSection('features-section')}>Recursos</button></li>
                                <li><button onClick={() => scrollToSection('prices-section')}>Planos</button></li>
                                <li><a href="https://wa.me/5548991882575" target="_blank" rel="noreferrer">Contato</a></li>
                            </ul>
                        </div>

                        <div className="footer-col">
                            <h4>Suporte</h4>
                            <ul>
                                <li><button onClick={() => scrollToSection('faq-section')}>Dúvidas frequentes</button></li>
                                <li><a href="mailto:zappoupe@gmail.com">E-mail</a></li>
                                <li><Link to="/termos">Termos de uso</Link></li>
                            </ul>
                        </div>

                        <div className="footer-col">
                            <h4>Legal</h4>
                            <ul>
                                <li><Link to="/privacidade">Política de Privacidade</Link></li>
                                <li><Link to="/termos">Termos de uso</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="footer-divider" />

                <div className="footer-bottom">
                    <p className="footer-copy">© 2026 Zappoupe Finance Ltda. Todos os direitos reservados.</p>
                    <div className="footer-policy">
                        <Link to="/privacidade">Política de Privacidade</Link>
                        <span>·</span>
                        <Link to="/termos">Termos de uso</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};
