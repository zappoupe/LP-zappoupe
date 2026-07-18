// src/hooks/useReveal.ts
import { useEffect, useRef, useState } from 'react';

/**
 * Marca a seção como visível na primeira vez que ela entra na viewport.
 * Dispara uma vez só — depois desconecta, pra não ficar observando à toa.
 *
 * Uso:
 *   const { ref, visible } = useReveal<HTMLElement>();
 *   <section ref={ref} className={visible ? 'is-visible' : ''}>
 */
export function useReveal<T extends HTMLElement>(threshold = 0.12) {
    const ref = useRef<T | null>(null);
    // Sem suporte a IntersectionObserver, já nasce visível — nada some da tela.
    const [visible, setVisible] = useState(() => typeof IntersectionObserver === 'undefined');

    useEffect(() => {
        const el = ref.current;
        if (!el || typeof IntersectionObserver === 'undefined') return;

        const obs = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting) {
                    setVisible(true);
                    obs.disconnect();
                }
            },
            { threshold },
        );

        obs.observe(el);
        return () => obs.disconnect();
    }, [threshold]);

    return { ref, visible };
}
