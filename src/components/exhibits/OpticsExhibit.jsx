import { useRealityStore } from '../../state/useRealityStore.js';
import { Optics } from '../../engines/math/formulas.js';
import { REAL_PI } from '../../engines/math/parser.js';
import ExhibitFrame from '../ui/ExhibitFrame.jsx';
import DataTable from '../ui/DataTable.jsx';

const WAVELENGTH_NM = 550; // green light, roughly
const F_NUMBER = 4;

function AiryRings({ radiusPx, rings = 4 }) {
  return (
    <svg viewBox="0 0 300 300" width="100%" height="100%">
      <defs>
        <radialGradient id="airyGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="40%" stopColor="#7c9eff" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#7c9eff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="300" height="300" fill="#050508" />
      <circle cx="150" cy="150" r={Math.max(4, radiusPx)} fill="url(#airyGlow)" />
      {Array.from({ length: rings }).map((_, i) => (
        <circle
          key={i}
          cx="150" cy="150"
          r={Math.max(2, radiusPx * (1 + i * 1.6))}
          fill="none"
          stroke="#ffb37c"
          strokeOpacity={0.35 - i * 0.07}
          strokeWidth="1.5"
        />
      ))}
    </svg>
  );
}

export default function OpticsExhibit() {
  const parsed = useRealityStore((s) => s.parsed);
  const p = parsed.kind === 'real' ? parsed.value : parsed.kind === 'infinite' ? parsed.value : REAL_PI;

  const airyRadius = Optics.lensAiryDiskRadius(WAVELENGTH_NM, F_NUMBER, p);
  const realAiryRadius = Optics.lensAiryDiskRadius(WAVELENGTH_NM, F_NUMBER, REAL_PI);
  const diffractionAngle = Optics.diffractionAngle(WAVELENGTH_NM, 5000, p);

  // Map physical nm radius to a display pixel radius, log-scaled so extreme
  // p values stay legible instead of exploding off-canvas.
  const displayRadius = Number.isFinite(airyRadius)
    ? Math.min(120, Math.max(3, 12 * Math.log10(Math.max(airyRadius, 1))))
    : 3;

  const resolvable = Number.isFinite(p) && p > 1.8 && p < 5.5;

  const dataRows = [
    ['Airy disk radius', Number.isFinite(airyRadius) ? `${airyRadius.toFixed(1)} nm` : '—'],
    ['Real-π Airy disk radius', `${realAiryRadius.toFixed(1)} nm`],
    ['Diffraction angle', Number.isFinite(diffractionAngle) ? `${diffractionAngle.toExponential(3)} rad` : '—'],
    ['Optical resolution', resolvable ? 'Plausible' : 'Breaks down'],
  ];

  return (
    <section className="grid-2col">
      <div className="glass" style={{ height: '420px', overflow: 'hidden' }}>
        {parsed.kind === 'complex' ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '24px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '360px' }}>
              A complex π gives diffraction angles no real optical meaning — lenses have no
              interpretation here.
            </p>
          </div>
        ) : (
          <ExhibitFrame
            visualLabel={`Airy diffraction pattern: a bright central disk of radius ${displayRadius.toFixed(0)} pixels surrounded by faint concentric rings, representing how a point of light spreads through a lens under this reality's pi`}
            dataView={<DataTable caption="Optics measurements at your current π" rows={dataRows} />}
          >
            <AiryRings radiusPx={displayRadius} />
          </ExhibitFrame>
        )}
      </div>

      <div className="glass" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <h3 className="display" style={{ margin: 0, fontSize: '18px' }}>Optics</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
          Airy radius = (3.8317/p)·λ·N &nbsp;·&nbsp; Diffraction angle = 2p·λ/aperture
        </p>
        <Row label="Airy disk radius" value={Number.isFinite(airyRadius) ? `${airyRadius.toFixed(1)} nm` : '—'} />
        <Row label="Real-π Airy disk radius" value={`${realAiryRadius.toFixed(1)} nm`} />
        <div style={{
          marginTop: '6px', padding: '12px 14px', borderRadius: 'var(--radius-sm)',
          background: resolvable ? 'rgba(107,255,176,0.08)' : 'rgba(255,107,107,0.08)',
          border: `1px solid ${resolvable ? 'rgba(107,255,176,0.3)' : 'rgba(255,107,107,0.3)'}`,
        }}>
          <strong style={{ fontSize: '13px', color: resolvable ? 'var(--success)' : 'var(--danger)' }}>
            {resolvable ? '✓ Lenses still focus light coherently' : '✕ Optics breaks down'}
          </strong>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '6px 0 0' }}>
            {resolvable
              ? 'The Airy disk stays a sensible size — telescopes, cameras, and eyes could plausibly still focus light into sharp images.'
              : 'The diffraction-limited spot either vanishes to a point (impossible resolution) or balloons so wide that no lens could ever produce a sharp image — imaging technology as we know it could not exist.'}
          </p>
        </div>
      </div>
    </section>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
      <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ fontFamily: 'monospace' }}>{value}</span>
    </div>
  );
}
