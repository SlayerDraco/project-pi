import { useEffect, useState } from 'react';
import { parseConstant, tryFastParse, PRESETS } from '../../engines/math/parser.js';
import { useRealityStore } from '../../state/useRealityStore.js';

export default function InputConsole() {
  const rawInput = useRealityStore((s) => s.rawInput);
  const setInput = useRealityStore((s) => s.setInput);
  const simulate = useRealityStore((s) => s.simulate);
  const [simulating, setSimulating] = useState(false);
  const [preview, setPreview] = useState(() => tryFastParse(rawInput) ?? { kind: 'pending' });

  // Debounced live preview: fast path resolves instantly; symbolic
  // expressions lazy-load mathjs after a short pause in typing.
  useEffect(() => {
    const fast = tryFastParse(rawInput);
    if (fast) {
      setPreview(fast);
      return undefined;
    }
    setPreview({ kind: 'pending' });
    const timer = setTimeout(async () => {
      const result = await parseConstant(rawInput);
      setPreview(result);
    }, 250);
    return () => clearTimeout(timer);
  }, [rawInput]);

  const handleSimulate = async () => {
    setSimulating(true);
    await new Promise((r) => setTimeout(r, 500)); // let the transition breathe, per UX spec
    await simulate(rawInput);
    setSimulating(false);
  };

  const canSimulate = preview.kind !== 'invalid' && preview.kind !== 'pending';

  return (
    <div className="glass" style={styles.wrap}>
      <label htmlFor="pi-input" style={styles.label}>🔧 Rewrite the universe — new value of π</label>
      <div style={styles.row}>
        <input
          id="pi-input"
          value={rawInput}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && canSimulate && handleSimulate()}
          placeholder="Try 22/7, sqrt(2), 2+3i, or Infinity…"
          style={styles.input}
          spellCheck={false}
          autoComplete="off"
        />
        <button onClick={handleSimulate} disabled={simulating || !canSimulate} style={styles.simulateBtn}>
          {simulating ? '⏳ Simulating…' : '▶ Simulate'}
        </button>
      </div>

      <div style={styles.previewRow} aria-live="polite">
        {preview.kind === 'invalid' ? (
          <span style={{ color: 'var(--danger)' }}>🤔 Hmm, I couldn't make sense of that — try one of the presets below.</span>
        ) : preview.kind === 'pending' ? (
          <span style={{ color: 'var(--text-secondary)' }}>Resolving…</span>
        ) : (
          <span>
            That's <strong style={{ color: 'var(--accent-2)' }}>{preview.normalized}</strong>
            {preview.kind === 'complex' && <span style={{ color: 'var(--text-secondary)' }}> — a complex number! We'll switch to Complex Geometry mode ✨</span>}
          </span>
        )}
      </div>

      <div style={styles.chips}>
        {PRESETS.map((p) => (
          <button
            key={p.value}
            style={{ ...styles.chip, ...(rawInput === p.value ? styles.chipActive : {}) }}
            onClick={() => setInput(p.value)}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}

const styles = {
  wrap: { padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: '14px' },
  label: { fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' },
  row: { display: 'flex', gap: '10px' },
  input: {
    flex: 1, padding: '14px 16px', borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-glass)', background: 'rgba(255,255,255,0.04)',
    color: 'var(--text-primary)', fontSize: '16px', fontFamily: 'var(--font-display)',
  },
  simulateBtn: {
    padding: '14px 26px', borderRadius: 'var(--radius-sm)', border: 'none',
    background: 'linear-gradient(120deg, var(--accent), var(--accent-2))',
    color: '#0a0a10', fontWeight: 700, fontSize: '14px', whiteSpace: 'nowrap',
  },
  previewRow: { fontSize: '13px', color: 'var(--text-secondary)' },
  chips: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '2px' },
  chip: {
    padding: '7px 14px', fontSize: '12px', fontWeight: 500, borderRadius: '999px',
    border: '1px solid var(--border-glass)', background: 'rgba(255,255,255,0.03)',
    color: 'var(--text-secondary)',
  },
  chipActive: {
    background: 'rgba(139,124,255,0.18)', borderColor: 'var(--accent)', color: 'var(--text-primary)',
  },
};
