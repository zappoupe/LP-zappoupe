// src/components/Faq/Faq.tsx
import { useState } from "react";
import BgFaq from "../../assets/bg-faq.png"; // O fundo verde água
import IconMobile from "../../assets/mobile.svg"; 
import IconPromote from "../../assets/promote.svg"; 
import IconMoney from "../../assets/moneys.svg"; 
import IconBribe from "../../assets/bribe.svg"; 
import IconYesNo from "../../assets/yesno.svg"; 
import IconDecree from "../../assets/decree.svg"; 
import "./Faq.css";

export const Faq = () => {
    // Estado para controlar qual pergunta está aberta (começa com null = todas fechadas)
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    // Função que abre/fecha a pergunta
    const toggleFaq = (index: number) => {
        if (openIndex === index) {
            setOpenIndex(null); // Se clicar na que já tá aberta, ela fecha
        } else {
            setOpenIndex(index); // Abre a nova que foi clicada
        }
    };

    // Lista com as suas perguntas e respostas
    const faqData = [
        {
            icon: IconMobile,
            question: "O ZAPPOUPE É UM APLICATIVO ?",
            answer: "Não! É um assistente que funciona diretamente no WhatsApp. Sem downloads, sem complicações."
        },
        {
            icon: IconPromote,
            question: "PRECISO FALAR COM ELE TODOS OS DIAS ?",
            answer: "Não precisa, porém quanto mais você usa o ZapPoupe, mais ele entende seu perfil e cria estratégias financeiras sob medida, ajudando você a economizar e planejar com muito mais clareza."
        },
        {
            icon: IconMoney,
            question: "E SE EU NÃO ENTENDER DE FINANÇAS ?",
            answer: "Fique tranquilo(a)! O ZapPoupe foi feito para te auxiliar em todas as suas dúvidas sobre dinheiro. Ele explica tudo de forma simples, prática e fácil de entender, mesmo que você nunca tenha lidado com finanças antes."
        },
        {
            icon: IconYesNo,
            question: "COMO EU INFORMO MEUS GASTOS E RECEITAS ?",
            answer: "Você pode mandar mensagens de texto, áudios ou até fotos das notas fiscais. O ZapPoupe entende tudo e registra para você."
        },
        {
            icon: IconBribe,
            question: "O ZAPPOUPE FUNCIONA PARA QUEM TEM RENDA VARIÁVEL OU INFORMAL ?",
            answer: "Com certeza! Ele foi feito para se adaptar à sua realidade, seja salário fixo, renda informal ou até quem vive de freelas."
        },
        {
            icon: IconDecree,
            question: "O ZAPPOUPE ME AJUDA A ECONOMIZAR DE VERDADE ?",
            answer: "Sim! Além de mostrar para onde o dinheiro está indo, ele te envia sugestões personalizadas para reduzir gastos e melhorar sua saúde financeira."
        }
    ];

    return (
        <section className="faq-section" id="faq-section">
            <div className="faq-background">
                <img src={BgFaq} alt="Fundo Abstrato FAQ" />
            </div>

            <div className="faq-content">
                
                {/* Lado Esquerdo: Textos */}
                <div className="faq-left">
                    <h2 className="faq-title card-anim-1">DÚVIDAS FREQUENTES</h2>
                    <p className="faq-description card-anim-2">
                        É super normal ter algumas perguntas antes de dar o primeiro passo. 
                        Separamos as dúvidas mais comuns de quem está prestes a transformar a 
                        vida financeira. Dá uma olhadinha!
                    </p>
                </div>

                {/* Lado Direito: Lista de Perguntas (Sanfona) */}
                <div className="faq-right">
                    {faqData.map((item, index) => {
                        const isOpen = openIndex === index;

                        return (
                            <div 
                                key={index} 
                                className={`faq-item card-anim-${index + 3} ${isOpen ? 'open' : ''}`}
                                onClick={() => toggleFaq(index)}
                            >
                                <div className="faq-item-header">
                                    <img className="faq-icon" alt="Ícone" src={item.icon} />
                                    <p className="faq-question">{item.question}</p>
                                    
                                    {/* Sinalzinho de + e - no canto */}
                                    <span className="faq-toggle-icon">{isOpen ? '-' : '+'}</span>
                                </div>
                                
                                <div className="faq-item-body">
                                    <p className="faq-answer">{item.answer}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};