// src/components/ui/Stars.tsx
import { Star } from 'lucide-react';
import './Stars.css';

interface StarsProps {
    /** Quantas estrelas cheias exibir (padrão 5). */
    count?: number;
    size?: number;
}

/** Avaliação em estrelas — Lucide preenchido, no lugar do caractere ★. */
export const Stars = ({ count = 5, size = 15 }: StarsProps) => (
    <span className="zp-stars" role="img" aria-label={`Avaliação ${count} de 5 estrelas`}>
        {Array.from({ length: count }, (_, i) => (
            <Star key={i} size={size} strokeWidth={0} fill="currentColor" aria-hidden="true" />
        ))}
    </span>
);
