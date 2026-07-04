import { useEffect, useState } from 'react';

/**
 * Accessibility Layer — Exhibit Frame
 * -----------------------------------------------------
 * Wraps any exhibit's visual (Canvas/SVG) with:
 *  - A toggle to switch to a plain-text/table "data view" of the same
 *    information, for screen readers and anyone who prefers not to rely
 *    on a 3D scene to understand the exhibit.
 *  - An automatic default to data view when the OS-level
 *    prefers-reduced-motion setting is active.
 *  - An aria-label describing the visual for assistive tech.
 *
 * Usage:
 *   <ExhibitFrame
 *     visualLabel="Rotating sphere and orbit ring representing Earth"
 *     dataView={<table>...</table>}
 *   >
 *     <Canvas>...</Canvas>
 *   </ExhibitFrame>
 */
export default function ExhibitFrame({ children, dataView, visualLabel = 'Interactive 3D exhibit visualization' }) {
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [mode, setMode] = useState(prefersReducedMotion ? 'data' : 'visual');

  useEffect(() => {
    if (prefersReducedMotion) setMode('data');
  }, [prefersReducedMotion]);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={styles.toggleRow}>
        <button
          onClick={() => setMode('visual')}
          aria-pressed={mode === 'visual'}
          style={{ ...styles.toggleBtn, ...(mode === 'visual' ? styles.toggleBtnActive : {}) }}
        >
          🎨 Visual
        </button>
        <button
          onClick={() => setMode('data')}
          aria-pressed={mode === 'data'}
          style={{ ...styles.toggleBtn, ...(mode === 'data' ? styles.toggleBtnActive : {}) }}
        >
          🔡 Data view
        </button>
      </div>

      <div style={{ flex: 1, position: 'relative' }} role="img" aria-label={mode === 'visual' ? visualLabel : undefined}>
        {mode === 'visual' ? children : (
          <div style={styles.dataViewWrap}>{dataView}</div>
        )}
      </div>
    </div>
  );
}

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false
  );
  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e) => setMatches(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [query]);
  return matches;
}

const styles = {
  toggleRow: { display: 'flex', gap: '6px', padding: '10px 10px 0' },
  toggleBtn: {
    padding: '5px 10px', fontSize: '11px', borderRadius: '999px',
    border: '1px solid var(--border-glass)', background: 'transparent', color: 'var(--text-secondary)',
  },
  toggleBtnActive: { background: 'var(--accent)', color: '#0a0a10', border: '1px solid var(--accent)' },
  dataViewWrap: { height: '100%', overflowY: 'auto', padding: '16px 20px' },
};
