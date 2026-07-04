import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Line } from '@react-three/drei';
import { useRealityStore } from '../../state/useRealityStore.js';
import CanvasErrorBoundary from '../ui/CanvasErrorBoundary.jsx';
import { generateGearGeometry, generateArchPoints } from '../../engines/engineering/generateGear.js';
import { Engineering } from '../../engines/math/formulas.js';
import { REAL_PI } from '../../engines/math/parser.js';

function Gear({ p, position, color, real }) {
  const geo = useMemo(() => generateGearGeometry(real ? REAL_PI : p, { radius: 1, teeth: 12 }), [p, real]);
  const ref = useRef();
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.z += dt * (real ? -0.4 : 0.4); });
  return (
    <mesh geometry={geo} ref={ref} position={position}>
      <meshStandardMaterial color={color} roughness={0.4} metalness={0.5} />
    </mesh>
  );
}

function Arch({ p }) {
  const points = useMemo(() => generateArchPoints(p, { span: 4, rise: 1.4 }), [p]);
  return <Line points={points} color="#6bffb0" lineWidth={2} />;
}

export default function EngineeringExhibit() {
  const parsed = useRealityStore((s) => s.parsed);
  const p = parsed.kind === 'real' ? parsed.value : parsed.kind === 'infinite' ? parsed.value : REAL_PI;

  const thrust = Engineering.archThrustFactor(4, 1.4, p);
  const realThrust = Engineering.archThrustFactor(4, 1.4, REAL_PI);
  const meshes = Number.isFinite(p) && Math.abs(p - REAL_PI) < 0.15;

  return (
    <section className="grid-2col">
      <div className="glass" style={{ height: '420px', overflow: 'hidden' }}>
        {parsed.kind === 'complex' ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '24px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '360px' }}>
              Gear teeth and arch curvature need a real-valued angular sweep — a complex π has
              no literal mechanical interpretation here.
            </p>
          </div>
        ) : (
          <CanvasErrorBoundary>
            <Canvas camera={{ position: [0, 1, 8], fov: 45 }}>
              <ambientLight intensity={0.6} />
              <directionalLight position={[5, 5, 5]} intensity={1.1} />
              <Gear p={p} position={[-1.05, 1.4, 0]} color="#7c9eff" />
              <Gear p={p} position={[1.05, 1.4, 0]} color="#ffb37c" real />
              <group position={[0, -1.2, 0]}>
                <Arch p={p} />
              </group>
              <OrbitControls enablePan={false} />
            </Canvas>
          </CanvasErrorBoundary>
        )}
      </div>

      <div className="glass" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <h3 className="display" style={{ margin: 0, fontSize: '18px' }}>⚙️ Gears &amp; Bridges</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
          Arch thrust factor = p·span / (8·rise)
        </p>
        <Row label="Arch thrust factor" value={Number.isFinite(thrust) ? thrust.toFixed(3) : '—'} />
        <Row label="Real-π thrust factor" value={realThrust.toFixed(3)} />
        <div style={{
          marginTop: '6px', padding: '12px 14px', borderRadius: 'var(--radius-sm)',
          background: meshes ? 'rgba(107,255,176,0.08)' : 'rgba(255,107,107,0.08)',
          border: `1px solid ${meshes ? 'rgba(107,255,176,0.3)' : 'rgba(255,107,107,0.3)'}`,
        }}>
          <strong style={{ fontSize: '13px', color: meshes ? 'var(--success)' : 'var(--danger)' }}>
            {meshes ? '✓ Gears mesh cleanly' : '✕ Gears do not mesh'}
          </strong>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '6px 0 0' }}>
            The blue gear is built with your experimental π; the orange gear is built with the
            real π. {meshes
              ? 'Close enough that their teeth still interlock.'
              : 'Their tooth spacing has diverged so far that no real-world gearbox could combine both — any machine mixing "reality-constants" like this would seize immediately.'}
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
