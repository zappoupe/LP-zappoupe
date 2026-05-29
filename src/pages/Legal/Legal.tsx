// src/pages/Legal/Legal.tsx
import { useEffect } from "react";
import { Link } from "react-router-dom";
import ImgLogo from "../../assets/logo.png";
import "./Legal.css";

interface Section {
    heading: string;
    body: string[];
}

function LegalLayout({ title, updated, sections }: { title: string; updated: string; sections: Section[] }) {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="legal">
            <div className="legal-bg" aria-hidden="true" />

            <header className="legal-top">
                <Link to="/" className="legal-brand">
                    <img src={ImgLogo} alt="" />
                    <span>ZapPoupe</span>
                </Link>
                <Link to="/" className="legal-back">← Voltar ao site</Link>
            </header>

            <main className="legal-main">
                <span className="legal-eyebrow">
                    <span className="legal-eyebrow-dot" /> DOCUMENTO LEGAL
                </span>
                <h1 className="legal-title">{title}</h1>
                <p className="legal-updated">Última atualização: {updated}</p>

                <div className="legal-card">
                    {sections.map((s, i) => (
                        <section className="legal-section" key={i}>
                            <h2>{`${i + 1}. ${s.heading}`}</h2>
                            {s.body.map((p, j) => (
                                <p key={j}>{p}</p>
                            ))}
                        </section>
                    ))}
                </div>

                <div className="legal-cta">
                    <Link to="/" className="legal-home-btn">Voltar para a página inicial</Link>
                </div>
            </main>
        </div>
    );
}

const ATUALIZADO = "28 de maio de 2026";

export const PrivacyPolicy = () => (
    <LegalLayout
        title="Política de Privacidade"
        updated={ATUALIZADO}
        sections={[
            {
                heading: "Quem somos",
                body: [
                    "O ZapPoupe é um assistente financeiro que opera dentro do WhatsApp, operado pela Zappoupe Finance Ltda. Esta Política de Privacidade explica como coletamos, usamos, armazenamos e protegemos seus dados pessoais, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD).",
                    "Ao utilizar o ZapPoupe, você concorda com as práticas descritas neste documento.",
                ],
            },
            {
                heading: "Dados que coletamos",
                body: [
                    "Dados de cadastro: nome, e-mail e número de telefone (WhatsApp), informados por você no momento da contratação.",
                    "Dados financeiros que você registra: descrições de gastos e receitas, valores, categorias, lembretes e metas que você envia ao assistente por texto, áudio ou imagem.",
                    "Dados de pagamento: processados diretamente pela Stripe. Não armazenamos os dados completos do seu cartão em nossos servidores.",
                    "Dados de uso: registros técnicos de interação com o assistente, necessários para o funcionamento e melhoria do serviço.",
                ],
            },
            {
                heading: "Como usamos seus dados",
                body: [
                    "Utilizamos seus dados para: registrar e organizar suas finanças; gerar relatórios, categorizações e sugestões personalizadas; enviar lembretes e mensagens relacionadas ao serviço; processar pagamentos e gerenciar sua assinatura; e dar suporte ao cliente.",
                    "Não vendemos seus dados pessoais a terceiros.",
                ],
            },
            {
                heading: "Compartilhamento com terceiros",
                body: [
                    "Para operar o serviço, compartilhamos dados estritamente necessários com provedores de tecnologia: Stripe (processamento de pagamentos), provedores de mensageria do WhatsApp (envio e recebimento de mensagens), Supabase (armazenamento de dados) e provedores de inteligência artificial (interpretação das suas mensagens).",
                    "Esses parceiros tratam os dados apenas conforme nossas instruções e suas próprias políticas de segurança.",
                ],
            },
            {
                heading: "Armazenamento e segurança",
                body: [
                    "Seus dados são armazenados em ambiente seguro, com controles de acesso e criptografia em trânsito. Adotamos medidas técnicas e organizacionais para proteger suas informações contra acesso não autorizado, perda ou alteração indevida.",
                ],
            },
            {
                heading: "Seus direitos (LGPD)",
                body: [
                    "Você pode, a qualquer momento, solicitar: confirmação da existência de tratamento; acesso aos seus dados; correção de dados incompletos ou desatualizados; anonimização ou eliminação de dados; portabilidade; e revogação do consentimento.",
                    "Para exercer seus direitos, entre em contato pelo e-mail zappoupe@gmail.com.",
                ],
            },
            {
                heading: "Retenção de dados",
                body: [
                    "Mantemos seus dados enquanto sua conta estiver ativa. Após o encerramento, os dados podem ser mantidos pelo período necessário para cumprir obrigações legais ou eliminados mediante sua solicitação.",
                ],
            },
            {
                heading: "Alterações nesta política",
                body: [
                    "Podemos atualizar esta Política periodicamente. A versão vigente estará sempre disponível nesta página, com a data da última atualização.",
                ],
            },
            {
                heading: "Contato",
                body: [
                    "Dúvidas sobre privacidade e proteção de dados podem ser enviadas para zappoupe@gmail.com.",
                ],
            },
        ]}
    />
);

export const TermsOfUse = () => (
    <LegalLayout
        title="Termos de Uso"
        updated={ATUALIZADO}
        sections={[
            {
                heading: "Aceitação dos termos",
                body: [
                    "Ao contratar e utilizar o ZapPoupe, você concorda integralmente com estes Termos de Uso. Caso não concorde, não utilize o serviço.",
                ],
            },
            {
                heading: "Descrição do serviço",
                body: [
                    "O ZapPoupe é um assistente financeiro que funciona dentro do WhatsApp, permitindo registrar gastos e receitas por texto, áudio ou foto, receber lembretes, categorizações automáticas e acompanhar sua saúde financeira.",
                    "O ZapPoupe é uma ferramenta de organização financeira e não constitui consultoria de investimentos ou aconselhamento financeiro profissional.",
                ],
            },
            {
                heading: "Cadastro e conta",
                body: [
                    "Você é responsável pela veracidade dos dados informados e pela guarda da sua senha de acesso. O uso da conta é pessoal e intransferível.",
                    "No plano Família, o titular é responsável pelos membros que convidar.",
                ],
            },
            {
                heading: "Planos, pagamento e teste grátis",
                body: [
                    "Oferecemos planos Individual e Família, com cobrança mensal ou anual, processada pela Stripe. Novas assinaturas incluem um período de teste de 30 dias, sem cobrança no ato da contratação.",
                    "Após o período de teste, a cobrança é realizada automaticamente conforme o plano escolhido, renovando-se de forma recorrente até o cancelamento.",
                ],
            },
            {
                heading: "Cancelamento",
                body: [
                    "Você pode cancelar sua assinatura a qualquer momento, inclusive durante o período de teste, diretamente pelo painel do usuário. Após o cancelamento, o acesso permanece ativo até o fim do período já pago.",
                ],
            },
            {
                heading: "Uso aceitável",
                body: [
                    "Você concorda em não utilizar o ZapPoupe para fins ilícitos, fraudulentos ou que violem direitos de terceiros, nem tentar comprometer a segurança ou o funcionamento do serviço.",
                ],
            },
            {
                heading: "Limitação de responsabilidade",
                body: [
                    "O ZapPoupe é fornecido 'como está'. Empenhamo-nos para manter o serviço disponível e preciso, mas não garantimos ausência de interrupções ou erros. As decisões financeiras tomadas com base nas informações do assistente são de responsabilidade do usuário.",
                ],
            },
            {
                heading: "Propriedade intelectual",
                body: [
                    "Todo o conteúdo, marca, software e identidade visual do ZapPoupe pertencem à Zappoupe Finance Ltda. e não podem ser copiados ou reproduzidos sem autorização.",
                ],
            },
            {
                heading: "Alterações nos termos",
                body: [
                    "Podemos atualizar estes Termos periodicamente. A versão vigente estará sempre disponível nesta página, com a data da última atualização.",
                ],
            },
            {
                heading: "Contato",
                body: [
                    "Dúvidas sobre estes Termos podem ser enviadas para zappoupe@gmail.com.",
                ],
            },
        ]}
    />
);
