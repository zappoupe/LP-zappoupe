// src/components/WhatsAppDemo/WhatsAppDemo.tsx
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { MousePointerClick } from 'lucide-react';
import './WhatsAppDemo.css';

/* ─────────────────────────  tipos  ───────────────────────── */

type Sender = 'user' | 'bot';

interface Message {
    id: number;
    from: Sender;
    /** 'audio' desenha o player de voz em vez de texto */
    kind: 'text' | 'audio';
    content?: ReactNode;
    time: string;
}

type DemoId = 'gasto' | 'audio' | 'saldo' | 'lembrete';

interface Chip {
    id: DemoId;
    label: string;
}

/* ─────────────────────────  helpers  ───────────────────────── */

const prefersReduced = () =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const clock = () =>
    new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

const sleep = (ms: number) =>
    new Promise<void>((r) => setTimeout(r, prefersReduced() ? 0 : ms));

/** Alturas fixas da onda do áudio — constantes pra não redesenhar a cada render. */
const WAVE = [6, 11, 17, 9, 14, 19, 8, 13, 18, 10, 16, 7, 12, 15, 9, 17, 11, 6];

const CHIPS: Chip[] = [
    { id: 'gasto', label: 'Gastei 50 no mercado 🛒' },
    { id: 'audio', label: '🎤 Mandar um áudio' },
    { id: 'saldo', label: 'Quanto gastei esse mês?' },
    { id: 'lembrete', label: 'Me lembra da fatura dia 10' },
];

/* ─────────────────────  conteúdo das respostas  ───────────────────── */

const Bar = ({ pct }: { pct: number }) => (
    <span className="wad-bar" aria-hidden="true">
        <i style={{ width: `${pct}%` }} />
    </span>
);

const RESPOSTA_GASTO = (
    <>
        Anotado! 💸 <b>R$ 50,00</b> registrado.
        <span className="wad-cat">🍽 Alimentação</span>
        <span className="wad-line">Mercado no mês:</span>
        <Bar pct={62} />
        <b>R$ 412 / R$ 650</b>
        <span className="wad-line">
            Você ainda tem <b>R$ 238</b> de folga nessa categoria. 🎉
        </span>
    </>
);

const RESPOSTA_AUDIO = (
    <>
        Ouvi direitinho! 🎧 Você disse:
        <span className="wad-quote">"paguei 120 de conta de luz"</span>
        <span className="wad-cat">💡 Casa &amp; Contas</span>
        <span className="wad-line">
            Registrei <b>R$ 120,00</b>. Quer que eu te lembre dessa conta todo mês?
        </span>
    </>
);

const RESPOSTA_SALDO = (
    <>
        Seu resumo do mês até agora: 📊
        <span className="wad-line">
            🍽 Alimentação — <b>R$ 412</b>
        </span>
        <Bar pct={62} />
        <span className="wad-line">
            🚗 Transporte — <b>R$ 230</b>
        </span>
        <Bar pct={35} />
        <span className="wad-line">
            💡 Casa — <b>R$ 384</b>
        </span>
        <Bar pct={58} />
        <span className="wad-line">
            Total: <b>R$ 1.026</b> · Você está <b>R$ 174 abaixo</b> do teto que definiu.
            Tá voando! ✈️
        </span>
    </>
);

const RESPOSTA_LEMBRETE = (
    <>
        Combinado! ⏰ Vou te avisar <b>dia 9</b>, um dia antes do vencimento da fatura.
        <span className="wad-cat">🔔 Lembrete criado</span>
        <span className="wad-line">
            Pode deixar comigo — nunca mais paga juros por esquecimento.
        </span>
    </>
);

const INTRO = (
    <>
        Oi! Eu sou o <b>ZapPoupe</b> 👋
        <span className="wad-line">
            Me conta um gasto do seu jeito — texto, áudio ou foto — que eu organizo tudo
            pra você.
        </span>
        <span className="wad-line">
            <b>Testa aí embaixo</b> 👇
        </span>
    </>
);

const FECHAMENTO = (
    <>
        É assim, simples desse jeito. 😄
        <span className="wad-line">
            Quer organizar a <b>sua</b> grana de verdade?
        </span>
        <span className="wad-line">
            <b>👉 Escolha seu plano ali embaixo e comece grátis.</b>
        </span>
    </>
);

/* ─────────────────────────  componente  ───────────────────────── */

export const WhatsAppDemo = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [typing, setTyping] = useState(false);
    const [busy, setBusy] = useState(true);
    const [done, setDone] = useState<DemoId[]>([]);

    const chatRef = useRef<HTMLDivElement | null>(null);
    const idRef = useRef(0);
    /** Vira true no unmount — toda sequência async checa antes de setState. */
    const deadRef = useRef(false);

    const push = useCallback((from: Sender, content: ReactNode, kind: Message['kind'] = 'text') => {
        setMessages((prev) => [
            ...prev,
            { id: ++idRef.current, from, kind, content, time: clock() },
        ]);
    }, []);

    /* Rola o chat pro fim a cada mensagem nova. */
    useEffect(() => {
        const el = chatRef.current;
        if (el) el.scrollTop = el.scrollHeight;
    }, [messages, typing]);

    useEffect(() => {
        deadRef.current = false;
        return () => {
            deadRef.current = true;
        };
    }, []);

    /* Sequência de abertura. Roda uma vez; em StrictMode (dev) a primeira
       execução é cancelada e a segunda reinicia do zero — daí o reset, que
       fica depois do primeiro await pra não virar setState síncrono. */
    useEffect(() => {
        let cancelled = false;

        (async () => {
            await sleep(700);
            if (cancelled) return;
            setMessages([]);
            setDone([]);
            setTyping(true);
            await sleep(1300);
            if (cancelled) return;
            setTyping(false);
            push('bot', INTRO);
            setBusy(false);
        })();

        return () => {
            cancelled = true;
            setTyping(false);
        };
    }, [push]);

    /** Mostra "digitando…" por `ms` e some. */
    const showTyping = async (ms: number) => {
        if (deadRef.current) return;
        setTyping(true);
        await sleep(ms);
        if (deadRef.current) return;
        setTyping(false);
    };

    const runDemo = async (id: DemoId) => {
        if (busy || done.includes(id)) return;
        setBusy(true);

        switch (id) {
            case 'gasto':
                push('user', 'Gastei 50 no mercado 🛒');
                await showTyping(1100);
                if (deadRef.current) return;
                push('bot', RESPOSTA_GASTO);
                break;

            case 'audio':
                push('user', undefined, 'audio');
                await showTyping(1400);
                if (deadRef.current) return;
                push('bot', RESPOSTA_AUDIO);
                break;

            case 'saldo':
                push('user', 'Quanto gastei esse mês?');
                await showTyping(1200);
                if (deadRef.current) return;
                push('bot', RESPOSTA_SALDO);
                break;

            case 'lembrete':
                push('user', 'Me lembra da fatura dia 10');
                await showTyping(1000);
                if (deadRef.current) return;
                push('bot', RESPOSTA_LEMBRETE);
                break;
        }

        const restantes = CHIPS.filter((c) => c.id !== id && !done.includes(c.id));
        setDone((prev) => [...prev, id]);

        // Última opção usada → mensagem de fechamento levando pros planos.
        if (restantes.length === 0) {
            await sleep(600);
            if (deadRef.current) return;
            await showTyping(900);
            if (deadRef.current) return;
            push('bot', FECHAMENTO);
        }

        if (!deadRef.current) setBusy(false);
    };

    const restantes = CHIPS.filter((c) => !done.includes(c.id));

    return (
        <div className="wad-wrap">
            <span className="wad-tag">
                <MousePointerClick size={15} strokeWidth={2.2} aria-hidden="true" />
                Testa aí, é de verdade
            </span>

            <div className="wad-phone">
                <div className="wad-screen">
                    {/* Cabeçalho estilo WhatsApp */}
                    <div className="wad-header">
                        <span className="wad-avatar" aria-hidden="true">Z</span>
                        <span className="wad-id">
                            <b>ZapPoupe</b>
                            <small>online</small>
                        </span>
                    </div>

                    {/* Conversa */}
                    <div
                        className="wad-chat"
                        ref={chatRef}
                        role="log"
                        aria-live="polite"
                        aria-label="Conversa de demonstração com o ZapPoupe"
                    >
                        {messages.map((m) =>
                            m.kind === 'audio' ? (
                                <div className="wad-msg wad-msg--user wad-audio" key={m.id}>
                                    <span className="wad-play" aria-hidden="true">▶</span>
                                    <span className="wad-wave" aria-hidden="true">
                                        {WAVE.map((h, i) => (
                                            <i key={i} style={{ height: `${h}px` }} />
                                        ))}
                                    </span>
                                    <span className="wad-dur">0:04</span>
                                    <span className="wad-sr">Áudio enviado: paguei 120 de conta de luz</span>
                                </div>
                            ) : (
                                <div className={`wad-msg wad-msg--${m.from}`} key={m.id}>
                                    {m.content}
                                    <span className="wad-time">
                                        {m.time}
                                        {m.from === 'user' && <b className="wad-ticks">✓✓</b>}
                                    </span>
                                </div>
                            ),
                        )}

                        {typing && (
                            <div className="wad-typing" aria-label="ZapPoupe está digitando">
                                <i /><i /><i />
                            </div>
                        )}
                    </div>

                    {/* Opções clicáveis */}
                    <div className="wad-chips">
                        <span className="wad-chips-label">
                            {restantes.length ? 'Escolha uma mensagem pra enviar:' : 'Foi só isso mesmo 😉'}
                        </span>
                        {restantes.map((c) => (
                            <button
                                className="wad-chip"
                                key={c.id}
                                onClick={() => void runDemo(c.id)}
                                disabled={busy}
                            >
                                {c.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
