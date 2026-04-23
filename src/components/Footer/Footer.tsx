import BgFooter from "../../assets/bg-footer.png";
import ImgLogo from "../../assets/logo-branca.png";
import IconInstagram from "../../assets/icon-instagram.svg";
import "./Footer.css";

export const Footer = () => {
    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <footer className="footer-section" id="footer-section">
            <div className="footer-background">
                <img src={BgFooter} alt="Fundo Footer" />
                <div className="footer-overlay"></div>
            </div>

            <div className="footer-content">
                <div className="footer-top">
                    <div className="footer-col brand-col">
                        <img className="footer-logo" alt="Zappoupe Logo" src={ImgLogo} />
                        <p className="brand-tagline">
                            Controle financeiro inteligente, direto no seu WhatsApp.
                        </p>
                    </div>

                    <div className="footer-col">
                        <h4>INSTITUCIONAL</h4>
                        <ul>
                            <li><a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Início</a></li>
                            <li><a href="#prices-section" onClick={(e) => { e.preventDefault(); scrollToSection('prices-section'); }}>Planos</a></li>
                            <li><a href="#features-section" onClick={(e) => { e.preventDefault(); scrollToSection('features-section'); }}>Como funciona</a></li>
                            <li><a href="https://wa.me/5548991882575" target="_blank" rel="noreferrer">Contato</a></li>
                        </ul>
                    </div>

                    <div className="footer-col">
                        <h4>SUPORTE</h4>
                        <ul>
                            <li><a href="#faq-section" onClick={(e) => { e.preventDefault(); scrollToSection('faq-section'); }}>Dúvidas frequentes</a></li>
                            <li><a href="mailto:zappoupe@gmail.com">E-mail</a></li>
                            <li><a href="#">Termos de uso</a></li>
                        </ul>
                    </div>

                    <div className="footer-col">
                        <h4>SIGA-NOS</h4>
                        <a href="https://www.instagram.com/zappoupe?igsh=MTkybWtiaXR4ZnV3ZA==" target="_blank" rel="noreferrer" className="social-link">
                            <img src={IconInstagram} alt="Instagram" />
                            <span>@Zappoupe</span>
                        </a>
                    </div>
                </div>

                <div className="footer-divider"></div>

                <div className="footer-bottom">
                    <p className="copyright-text">
                        © 2026 Zappoupe Finance Ltda. Todos os direitos reservados.
                    </p>
                    <div className="footer-policy">
                        <a href="#">Política de Privacidade</a>
                        <span>|</span>
                        <a href="#">Pagamento Seguro</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};