// src/components/ProofBar/ProofBar.tsx
import { PROOF_STATS, PROOF_NOTE } from '../../data/socialProof';
import './ProofBar.css';

export const ProofBar = () => (
    <div className="proofbar">
        <div className="proofbar-inner">
            {PROOF_STATS.map((s) => (
                <div className="proofbar-item" key={s.label}>
                    <b>{s.value}</b>
                    <span>
                        {s.label}
                        {s.footnote && '*'}
                    </span>
                </div>
            ))}
        </div>
        <p className="proofbar-note">*{PROOF_NOTE}</p>
    </div>
);
