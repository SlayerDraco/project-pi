import { useMemo } from 'react';
import { useRealityStore } from '../../state/useRealityStore.js';
import { generatePizzaSlices, generateCurveballPath } from '../../engines/sports/generateSports.js';
import { REAL_PI } from '../../engines/math/parser.js';
import ExhibitFrame from '../ui/ExhibitFrame.jsx';
import DataTable from '../ui/DataTable.jsx';

const SIZE = 220;
const CENTER = SIZE / 2;
const R = 95;
const SLICES = 8;

function polar(angle, radius) {
  return [CENTER + radius * Math.cos(angle), CENTER + radius * Math.sin(angle)];
}

function Pizza({ slices, closes }) {
  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width="100%" height="100%">
      <rect width={SIZE} height={SIZE} fill="#08080c" />
      <circle cx={CENTER} cy={CENTER} r={R} fill="#e8b06b" opacity={closes ? 1 : 0.5} />
      {slices.map((s, i) => {
        const [x1, y1] = polar(s.start, R);
        return <line key={i} x1={CENTER} y1={CENTER} x2={x1} y2={y1} stroke="#5a3a1a" strokeWidth="2" />;
      })}
      {!closes && (() => {
        const [x, y] = polar(slices[slices.length - 1].end, R);
        return <line x1={CENTER} y1={CENTER} x2={x} y2={y} stroke="#ff6b6b" strokeWidth="2.5" strokeDasharray="4 3" />;
      })()}
    </svg>
  );
}

function CurveballChart({ path, realPath }) {
  const W = 320, H = 160;
  const toPath = (pts) => pts.map(([x, y], i) => {
    const px = (x / 18) * W;
    const py = H / 2 - y * (H / 4);
    return `${i === 0 ? 'M' : 'L'}${px.toFixed(1)},${py.toFixed(1)}`;
  }).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H}>
      <rect width={W} height={H} fill="#08080c" />
      <line x1="0" y1={H / 2} x2={W} y2={H / 2} stroke="#2a2a34" strokeWidth="1" />
      <path d={toPath(realPath)} stroke="#3a3a45" strokeWidth="1.5" fill="none" strokeDasharray="4 4" />
      <path d={toPath(path)} stroke="#6bffb0" strokeWidth="2.5" fill="none" />
    </svg>
  );
}

export default function SportsExhibit() {
  const parsed = useRealityStore((s) => s.parsed);
  const p = parsed.kind === 'real' ? parsed.value : parsed.kind === 'infinite' ? parsed.value : REAL_PI;

  const slices = useMemo(() => generatePizzaSlices(Number.isFinite(p) ? p : REAL_PI, SLICES), [p]);
  const path = useMemo(() => generateCurveballPath(Number.isFinite(p) ? p : REAL_PI), [p]);
  const realPath = useMemo(() => generateCurveballPath(REAL_PI), []);

  const wedgeAngle = Number.isFinite(p) ? (2 * p) / SLICES : NaN;
  const realWedgeAngle = (2 * REAL_PI) / SLICES;
  const totalSweep = wedgeAngle * SLICES;
  const closes = Number.isFinite(totalSweep) && Math.abs(totalSweep - 2 * REAL_PI) < 0.05;

  const dataRows = [
    ['Slice angle', Number.isFinite(wedgeAngle) ? `${((wedgeAngle * 180) / REAL_PI).toFixed(1)}°` : '—'],
    ['Real-π slice angle', `${((realWedgeAngle * 180) / REAL_PI).toFixed(1)}°`],
    ['Pizza closes into a full circle', closes ? 'Yes' : 'No — gap or overlap visible'],
  ];

  return (
    <section className="grid-2col">
      <div className="glass" style={{ height: '420px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {parsed.kind === 'complex' ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '24px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '360px' }}>
              A complex π gives slice angles and spin trajectories imaginary components — sports
              equipment has no real-world shape here.
            </p>
          </div>
        ) : (
          <ExhibitFrame
            visualLabel={`A pizza cut into ${SLICES} slices${closes ? ', which meet perfectly to close the circle' : ', which leave a visible gap or overlap because the slice angles do not add up to a full circle'}, alongside a chart comparing a curving pitch's trajectory to how it would curve under the real pi.`}
            dataView={<DataTable caption="Sports measurements at your current π" rows={dataRows} />}
          >
            <div style={{ flex: 1 }}>
              <Pizza slices={slices} closes={closes} />
            </div>
            <div style={{ padding: '0 12px 12px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                Dashed = curveball path at real π · Solid = at your π
              </span>
              <CurveballChart path={path} realPath={realPath} />
            </div>
          </ExhibitFrame>
        )}
      </div>

      <div className="glass" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <h3 className="display" style={{ margin: 0, fontSize: '18px' }}>🍕 Sports: Pizza &amp; Pitches</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
          Slice angle = 2p / n &nbsp;·&nbsp; Curve deflection ∝ sin(p·t/2)
        </p>
        <Row label="Slice angle" value={Number.isFinite(wedgeAngle) ? `${((wedgeAngle * 180) / REAL_PI).toFixed(1)}°` : '—'} />
        <Row label="Real-π slice angle" value={`${((realWedgeAngle * 180) / REAL_PI).toFixed(1)}°`} />
        <div style={{
          marginTop: '6px', padding: '12px 14px', borderRadius: 'var(--radius-sm)',
          background: closes ? 'rgba(107,255,176,0.08)' : 'rgba(255,107,107,0.08)',
          border: `1px solid ${closes ? 'rgba(107,255,176,0.3)' : 'rgba(255,107,107,0.3)'}`,
        }}>
          <strong style={{ fontSize: '13px', color: closes ? 'var(--success)' : 'var(--danger)' }}>
            {closes ? '✓ Pizza divides evenly' : '✕ Pizza does not close'}
          </strong>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '6px 0 0' }}>
            {closes
              ? 'Eight equal slices sweep exactly one full turn, same as any real pizza.'
              : 'Eight "equal" slices no longer sweep a full turn — you\'d either have a gap of missing pizza or slices that overlap each other, because a full turn in this reality isn\'t 360° worth of your slice angle.'}
          </p>
        </div>
      </div>
    </section>
  );
}

function Row({ label, value }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '10px 14px', borderRadius: 'var(--radius-sm)',
      background: 'var(--bg-glass)', border: '1px solid var(--border-glass)',
    }}>
      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 600 }}>{value}</span>
    </div>
  );
}
