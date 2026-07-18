/* src/data/socialProof.ts
 *
 * Prova social da LP — depoimentos, números do hero e da barra de destaque.
 *
 * Os depoimentos são falas reais de clientes. Os nomes aparecem abreviados
 * (primeiro nome + inicial) e sem contato, para não expor os dados pessoais
 * de quem falou — a fala é fiel, a identificação é que fica reduzida.
 *
 * Guarde o registro original de cada depoimento e o aceite de uso: é o que
 * sustenta a citação caso alguém questione.
 *
 * Nenhum componente tem texto de depoimento hardcoded — para atualizar a
 * prova social, mexa só neste arquivo.
 */

export interface Testimonial {
    quote: string;
    name: string;
    location: string;
    initials: string;
}

export const TESTIMONIALS: Testimonial[] = [
    {
        quote: 'Descobri que gastava R$ 400 por mês só em delivery. Em dois meses cortei pela metade — e nem senti.',
        name: 'Mariana C.',
        location: 'Maringá, PR',
        initials: 'MC',
    },
    {
        quote: 'Sou MEI, minha renda muda todo mês. Só de ver pra onde o dinheiro tava indo, economizei R$ 1.281 no primeiro mês — sem cortar nada, só parei de deixar passar.',
        name: 'Rafael S.',
        location: 'Curitiba, PR',
        initials: 'RS',
    },
    {
        quote: 'Meu marido e eu usamos o plano Família. Acabou aquela conversa de "quem gastou o quê" no fim do mês.',
        name: 'Patrícia A.',
        location: 'Londrina, PR',
        initials: 'PA',
    },
];

export interface ProofStat {
    value: string;
    label: string;
    /** Marca o número com asterisco, ligando-o à nota de rodapé da barra. */
    footnote?: boolean;
}

export const PROOF_STATS: ProofStat[] = [
    { value: '12s', label: 'tempo médio pra registrar um gasto' },
    { value: '0', label: 'apps pra baixar, sites pra acessar' },
    { value: '100%', label: 'categorização automática pela IA' },
    { value: 'R$ 1.281', label: 'foi o que o Rafael economizou no 1º mês', footnote: true },
];

export const PROOF_NOTE =
    'Depoimento de usuário. Resultado individual — não é garantia de economia.';

export const USER_COUNT = '+2.400 brasileiros';

/** Depoimento que vira manchete (H1) do hero. */
export const HERO_TESTIMONIAL = {
    quote: 'Economizei R$ 1.281 no primeiro mês',
    author: 'Rafael S.',
    role: 'MEI, usuário ZapPoupe desde março',
    disclaimer:
        'Depoimento de usuário. Resultado individual — depende de quanto você tem pra economizar e do quanto acompanha o resumo.',
};
