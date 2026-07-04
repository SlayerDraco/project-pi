import { useMemo } from 'react';
import { useRealityStore } from '../../state/useRealityStore.js';
import { generateWaveform, generateIntensityFalloff } from '../../engines/signal/generateWaveform.js';
import { REAL_PI } from '../../engines/math/parser.js';

const W = 560;
const H = 200;

function toSvgPath(points, xDomain, yDomain, w = W, h = H) {
  const [x0, x1] = xDomain;
  const [y0, y1] = yDomain;
  return points
    .map(([x, y], i) => {
      const px = ((x - x0) / (x1 - x0)) * w;
      const py = h - ((y - y0) / (y1 - y0)) * h;
      return `${i === 0 ? 'M' : 'L'}${px.toFixed(2)},${py.toFixed(2)}`;
    })
    .join(' ');
}

export default function SignalExhibit() {
  const parsed = useRealityStore((s) => s.parsed);
  const p = parsed.kind === 'real' ? parsed.value : parsed.kind === 'infinite' ? parsed.value : REAL_PI;

  const wave = useMemo(() => generateWaveform(p), [p]);
  const realWave = useMemo(() => generateWaveform(REAL_PI), []);
  const falloff = useMemo(() => generateIntensityFalloff(p), [p]);

  const wavePath = Number.isFinite(p) ? toSvgPath(wave, [0, 2], [-1.2, 1.2]) : '';
  const realWavePath = toSvgPath(realWave, [0, 2], [-1.2, 1.2]);
  const falloffMax = Math.max(...falloff.filter((pt) => Number.isFinite(pt[1])).map((pt) => pt[1]), 1);
  const falloffPath = Number.isFinite(p) ? toSvgPath(falloff, [0, 5], [0, falloffMax]) : '';

  const inTune = Number.isFinite(p) && Math.abs(p - REAL_PI) < 0.05;

  return (
    <section className="grid-2col">
      <div className="glass" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {parsed.kind === 'complex' ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', textAlign: 'center', padding: '40px 0' }}>
            A complex π gives the waveform a complex phase — real audio has no interpretation
            here. See the Complex Geometry exhibit instead.
          </p>
        ) : (
          <>
            <div>
              <span style={styles.chartLabel}>WAVEFORM — sin(2·p·f·t)</span>
              <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={styles.svg}>
                <path d={realWavePath} stroke="#3a3a45" strokeWidth="1.5" fill="none" strokeDasharray="4 4" />
                <path d={wavePath} stroke="#7c9eff" strokeWidth="2" fill="none" />
              </svg>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                Dashed = your reality's waveform tuned at real π · Solid = at your π
              </span>
            </div>
            <div>
              <span style={styles.chartLabel}>SPHERICAL WAVE INTENSITY — I = Power / (4·p·r²)</span>
              <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={styles.svg}>
                <path d={falloffPath} stroke="#ffb37c" strokeWidth="2" fill="none" />
              </svg>
            </div>
          </>
        )}
      </div>

      <div className="glass" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <h3 className="display" style={{ margin: 0, fontSize: '18px' }}>Signal &amp; Acoustics</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
          Angular frequency ω = 2p·f &nbsp;·&nbsp; Intensity I = Power / (4p·r²)
        </p>
        <div style={{
          marginTop: '6px', padding: '12px 14px', borderRadius: 'var(--radius-sm)',
          background: inTune ? 'rgba(107,255,176,0.08)' : 'rgba(255,107,107,0.08)',
          border: `1px solid ${inTune ? 'rgba(107,255,176,0.3)' : 'rgba(255,107,107,0.3)'}`,
        }}>
          <strong style={{ fontSize: '13px', color: inTune ? 'var(--success)' : 'var(--danger)' }}>
            {inTune ? '✓ Waveform stays in tune' : '✕ Waveform detunes audibly'}
          </strong>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '6px 0 0' }}>
            {inTune
              ? 'Close enough to the real π that a sine wave still completes a clean, periodic cycle.'
              : 'Every "cycle" here uses a different amount of phase than a real sine wave — any musical instrument or radio tuned to real-world frequencies would sound instantly wrong, or stop functioning as a periodic signal at all.'}
          </p>
        </div>
      </div>
    </section>
  );
}

const styles = {
  chartLabel: { display: 'block', fontSize: '11px', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: '8px' },
  svg: { background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)' },
};
