// src/components/FinalCta/FinalCta.tsx
import { WhatsAppIcon } from '../ui/WhatsAppIcon';
import { goToPlans } from '../../lib/scroll';
import './FinalCta.css';

export const FinalCta = () => (
    <section className="finalcta zp-section">
        <div className="zp-container">
            <h2>Seu próximo gasto já pode ser o primeiro organizado.</h2>
            <p>
                30 dias grátis. Sem cartão. Sem fidelidade — cancele quando quiser, direto na
                conversa.
            </p>
            <button className="zp-cta" onClick={goToPlans}>
                <WhatsAppIcon />
                Começar agora no WhatsApp
            </button>
        </div>
    </section>
);
