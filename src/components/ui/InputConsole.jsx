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
      <label htmlFor="pi-input" style={styles.label}>New value of π</label>
      <div style={styles.row}>
        <input
          id="pi-input"
          value={rawInput}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && canSimulate && handleSimulate()}
          placeholder="e.g. 22/7, sqrt(2), 2+3i, Infinity…"
          style={styles.input}
          spellCheck={false}
          autoComplete="off"
        />
        <button onClick={handleSimulate} disabled={simulating || !canSimulate} style={styles.simulateBtn}>
          {simulating ? 'Simulating…' : 'Simulate'}
        </button>
      </div>

      <div style={styles.previewRow} aria-live="polite">
        {preview.kind === 'invalid' ? (
          <span style={{ color: 'var(--danger)' }}>Could not resolve that expression.</span>
        ) : preview.kind === 'pending' ? (
          <span style={{ color: 'var(--text-secondary)' }}>Resolving…</span>
        ) : (
          <span>
            Resolves to <strong style={{ color: 'var(--accent)' }}>{preview.normalized}</strong>
            {preview.kind === 'complex' && <span style={{ color: 'var(--text-secondary)' }}> — activates Complex Geometry mode</span>}
          </span>
        )}
      </div>

      <div style={styles.chips}>
        {PRESETS.map((p) => (
          <button key={p.value} style={styles.chip} onClick={() => setInput(p.value)}>
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}

const styles = {
  wrap: { padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '12px' },
  label: { fontSize: '11px', letterSpacing: '0.15em', color: 'var(--text-secondary)' },
  row: { display: 'flex', gap: '10px' },
  input: {
    flex: 1, padding: '12px 14px', borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-glass)', background: 'rgba(255,255,255,0.03)',
    color: 'var(--text-primary)', fontSize: '15px', fontFamily: 'monospace',
  },
  simulateBtn: {
    padding: '12px 22px', borderRadius: 'var(--radius-sm)', border: 'none',
    background: 'var(--accent)', color: '#0a0a10', fontWeight: 600, fontSize: '14px',
  },
  previewRow: { fontSize: '13px', color: 'var(--text-secondary)' },
  chips: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' },
  chip: {
    padding: '6px 12px', fontSize: '12px', borderRadius: '999px',
    border: '1px solid var(--border-glass)', background: 'rgba(255,255,255,0.03)',
    color: 'var(--text-secondary)',
  },
};
