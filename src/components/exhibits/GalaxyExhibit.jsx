import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Points, PointMaterial } from '@react-three/drei';
import { useRealityStore } from '../../state/useRealityStore.js';
import CanvasErrorBoundary from '../ui/CanvasErrorBoundary.jsx';
import ExhibitFrame from '../ui/ExhibitFrame.jsx';
import DataTable from '../ui/DataTable.jsx';
import { generateGalaxy, generateFieldStars } from '../../engines/astronomy/generateGalaxy.js';
import { REAL_PI } from '../../engines/math/parser.js';

function GalaxyPoints({ p }) {
  const positions = useMemo(() => new Float32Array(generateGalaxy(p).flat()), [p]);
  const ref = useRef();
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.z += dt * 0.05; });
  return (
    <group ref={ref}>
      <Points positions={positions} stride={3}>
        <PointMaterial size={0.045} color="#a6c1ff" transparent opacity={0.9} sizeAttenuation depthWrite={false} />
      </Points>
    </group>
  );
}

function FieldStars() {
  const positions = useMemo(() => new Float32Array(generateFieldStars().flat()), []);
  return (
    <Points positions={positions} stride={3}>
      <PointMaterial size={0.02} color="#5a5a70" transparent opacity={0.5} sizeAttenuation depthWrite={false} />
    </Points>
  );
}

export default function GalaxyExhibit() {
  const parsed = useRealityStore((s) => s.parsed);
  const p = parsed.kind === 'real' ? parsed.value : parsed.kind === 'infinite' ? parsed.value : REAL_PI;

  const armSeparation = Number.isFinite(p) ? (2 * p) / 3 : NaN; // radians between arms, 3-arm galaxy
  const realArmSeparation = (2 * REAL_PI) / 3;
  const windingTurns = Number.isFinite(p) ? (2.2 * 2 * p) / (2 * REAL_PI) : NaN;

  const coherent = Number.isFinite(p) && p > 2 && p < 5;

  const dataRows = [
    ['Arm angular separation', Number.isFinite(armSeparation) ? `${armSeparation.toFixed(3)} rad` : '—'],
    ['Real-π arm separation', `${realArmSeparation.toFixed(3)} rad`],
    ['Relative winding tightness', Number.isFinite(windingTurns) ? `${(windingTurns * 100).toFixed(0)}% of real` : '—'],
    ['Spiral structure', coherent ? 'Coherent' : 'Degenerate (arms overlap or unwind)'],
  ];

  return (
    <section className="grid-2col">
      <div className="glass" style={{ height: '420px', overflow: 'hidden', background: '#020204' }}>
        {parsed.kind === 'complex' ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '24px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '360px' }}>
              A complex π gives spiral arms an imaginary winding rate — no real galaxy shape
              exists here.
            </p>
          </div>
        ) : (
          <ExhibitFrame
            visualLabel={`A spiral galaxy made of star points with three arms, winding ${coherent ? 'in a coherent, recognizable spiral pattern' : 'so tightly or loosely that the arms overlap or barely spiral at all'}, slowly rotating.`}
            dataView={<DataTable caption="Galaxy measurements at your current π" rows={dataRows} />}
          >
            <CanvasErrorBoundary>
              <Canvas camera={{ position: [0, 5, 6], fov: 50 }}>
                <ambientLight intensity={0.3} />
                <FieldStars />
                <GalaxyPoints p={p} />
                <OrbitControls enablePan={false} />
              </Canvas>
            </CanvasErrorBoundary>
          </ExhibitFrame>
        )}
      </div>

      <div className="glass" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <h3 className="display" style={{ margin: 0, fontSize: '18px' }}>🌌 Galaxies</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
          Logarithmic spiral: r = a·e<sup>bθ</sup>, θ swept across 2p-radian turns
        </p>
        <Row label="Arm separation" value={Number.isFinite(armSeparation) ? `${armSeparation.toFixed(3)} rad` : '—'} />
        <Row label="Real-π arm separation" value={`${realArmSeparation.toFixed(3)} rad`} />
        <div style={{
          marginTop: '6px', padding: '12px 14px', borderRadius: 'var(--radius-sm)',
          background: coherent ? 'rgba(107,255,176,0.08)' : 'rgba(255,107,107,0.08)',
          border: `1px solid ${coherent ? 'rgba(107,255,176,0.3)' : 'rgba(255,107,107,0.3)'}`,
        }}>
          <strong style={{ fontSize: '13px', color: coherent ? 'var(--success)' : 'var(--danger)' }}>
            {coherent ? '✓ Recognizable spiral structure' : '✕ Spiral structure degenerates'}
          </strong>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '6px 0 0' }}>
            {coherent
              ? 'The three arms stay distinct and legible — a self-consistent alternate astrophysics could plausibly form galaxies shaped like this.'
              : "At this deviation the arms either wind so tightly they overlap into a solid disk, or unwind so loosely they barely curve at all — the elegant spiral structure real galaxies display wouldn't emerge."}
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
