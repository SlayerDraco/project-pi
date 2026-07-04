import { useMemo } from 'react';
import { useRealityStore } from '../../state/useRealityStore.js';
import { generatePhyllotaxis } from '../../engines/nature/generatePhyllotaxis.js';
import { REAL_PI } from '../../engines/math/parser.js';
import ExhibitFrame from '../ui/ExhibitFrame.jsx';
import DataTable from '../ui/DataTable.jsx';

const VIEW = 340;
const SCALE = 26;

function SeedField({ seeds }) {
  return (
    <svg viewBox={`0 0 ${VIEW} ${VIEW}`} width="100%" height="100%">
      <rect width={VIEW} height={VIEW} fill="#08080c" />
      {seeds.map((s) => (
        <circle
          key={s.index}
          cx={VIEW / 2 + s.x * SCALE}
          cy={VIEW / 2 + s.y * SCALE}
          r={2.1}
          fill={`hsl(${38 + (s.index % 40)}, 70%, ${55 + (s.index % 20)}%)`}
        />
      ))}
    </svg>
  );
}

export default function NatureExhibit() {
  const parsed = useRealityStore((s) => s.parsed);
  const p = parsed.kind === 'real' ? parsed.value : parsed.kind === 'infinite' ? parsed.value : REAL_PI;

  const { seeds, goldenAngle } = useMemo(() => generatePhyllotaxis(Number.isFinite(p) ? p : REAL_PI), [p]);
  const realGoldenAngle = generatePhyllotaxis(REAL_PI).goldenAngle;
  const goldenAngleDeg = (goldenAngle * 180) / REAL_PI;
  const realGoldenAngleDeg = (realGoldenAngle * 180) / REAL_PI;

  const packsEfficiently = Number.isFinite(p) && Math.abs(p - REAL_PI) < 0.08;

  const dataRows = [
    ['Golden angle (this reality)', `${goldenAngleDeg.toFixed(2)}°`],
    ['Golden angle (real π)', `${realGoldenAngleDeg.toFixed(2)}°`],
    ['Seed packing', packsEfficiently ? 'Optimal, no visible rows' : 'Visible straight rows / clumping'],
  ];

  return (
    <section className="grid-2col">
      <div className="glass" style={{ height: '420px', overflow: 'hidden' }}>
        {parsed.kind === 'complex' ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '24px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '360px' }}>
              A complex π gives the golden angle an imaginary component — there's no real
              seed-placement angle to plot.
            </p>
          </div>
        ) : (
          <ExhibitFrame
            visualLabel={`A sunflower-style seed spiral. Seeds are ${packsEfficiently ? 'packed with no visible gaps, in the elegant spiral pattern real sunflowers show' : 'arranged in visible straight rows or clumps rather than a smooth spiral, because the packing angle has shifted away from the golden angle'}.`}
            dataView={<DataTable caption="Nature measurements at your current π" rows={dataRows} />}
          >
            <SeedField seeds={seeds} />
          </ExhibitFrame>
        )}
      </div>

      <div className="glass" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <h3 className="display" style={{ margin: 0, fontSize: '18px' }}>🌻 Nature: Phyllotaxis</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
          Golden angle ψ = 2p·(1 − 1/φ) &nbsp;·&nbsp; seed i at angle i·ψ, radius c·√i
        </p>
        <Row label="Golden angle" value={`${goldenAngleDeg.toFixed(2)}°`} />
        <Row label="Real-π golden angle" value={`${realGoldenAngleDeg.toFixed(2)}°`} />
        <div style={{
          marginTop: '6px', padding: '12px 14px', borderRadius: 'var(--radius-sm)',
          background: packsEfficiently ? 'rgba(107,255,176,0.08)' : 'rgba(255,107,107,0.08)',
          border: `1px solid ${packsEfficiently ? 'rgba(107,255,176,0.3)' : 'rgba(255,107,107,0.3)'}`,
        }}>
          <strong style={{ fontSize: '13px', color: packsEfficiently ? 'var(--success)' : 'var(--danger)' }}>
            {packsEfficiently ? '✓ Optimal seed packing' : '✕ Packing efficiency lost'}
          </strong>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '6px 0 0' }}>
            {packsEfficiently
              ? 'Sunflowers, pinecones, and pineapples all use this exact angle because it never repeats into simple fractions — it packs seeds with zero wasted space. At your value, that property survives.'
              : "This angle no longer approximates the golden ratio's irrationality closely enough — you'd see obvious straight rows or radial gaps instead of a seamless spiral, because the packing keeps repeating at simple fractions of a turn."}
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
