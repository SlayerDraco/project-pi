import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Line } from '@react-three/drei';
import { useRealityStore } from '../../state/useRealityStore.js';
import CanvasErrorBoundary from '../ui/CanvasErrorBoundary.jsx';
import ExhibitFrame from '../ui/ExhibitFrame.jsx';
import DataTable from '../ui/DataTable.jsx';
import { generateSphereGeometry, generateRingOutline, adaptiveSegments } from '../../engines/geometry/generateCircle.js';
import { Astronomy } from '../../engines/math/formulas.js';
import { REAL_PI } from '../../engines/math/parser.js';

const SCHWARZSCHILD_DISPLAY_RADIUS = 1.2;
const SOLAR_MASS_KG = 1.989e30;

function EventHorizon({ p }) {
  const geo = useMemo(() => generateSphereGeometry(SCHWARZSCHILD_DISPLAY_RADIUS, p, adaptiveSegments(p, 48), adaptiveSegments(p, 32)), [p]);
  const ref = useRef();
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.y += dt * 0.1; });
  return (
    <mesh geometry={geo} ref={ref}>
      <meshStandardMaterial color="#050508" roughness={0.9} emissive="#1a0a2e" emissiveIntensity={0.5} />
    </mesh>
  );
}

function PhotonSphere({ p }) {
  const ring = useMemo(() => generateRingOutline(SCHWARZSCHILD_DISPLAY_RADIUS * 1.5, p, 200), [p]);
  
  return (
    <Line 
      // Wrap the array here
      points={Array.from(ring.attributes.position.array)} 
      color="#ffb37c" 
      lineWidth={1.5} 
      transparent 
      opacity={0.75} 
    />
  );
}

export default function BlackHoleExhibit() {
  const parsed = useRealityStore((s) => s.parsed);
  const p = parsed.kind === 'real' ? parsed.value : parsed.kind === 'infinite' ? parsed.value : REAL_PI;

  const horizonArea = Astronomy.horizonSurfaceArea(SCHWARZSCHILD_DISPLAY_RADIUS, p);
  const realHorizonArea = Astronomy.horizonSurfaceArea(SCHWARZSCHILD_DISPLAY_RADIUS, REAL_PI);
  const photonCirc = Astronomy.photonSphereCircumference(SCHWARZSCHILD_DISPLAY_RADIUS, p);
  const hawkingTemp = Astronomy.hawkingTemperature(10 * SOLAR_MASS_KG, p);
  const realHawkingTemp = Astronomy.hawkingTemperature(10 * SOLAR_MASS_KG, REAL_PI);

  const stable = Number.isFinite(p) && p > 1.5 && p < 6;

  return (
    <section className="grid-2col">
      <div className="glass" style={{ height: '420px', overflow: 'hidden' }}>
        {parsed.kind === 'complex' ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '24px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '360px' }}>
              A complex π gives the event horizon an imaginary radius — general relativity has no
              real-valued solution here. See the Complex Geometry exhibit instead.
            </p>
          </div>
        ) : (
          <ExhibitFrame
            visualLabel={`A dark event horizon sphere surrounded by an orange photon-sphere ring, sized according to your pi value. The horizon and ring stay in ${stable ? 'a coherent proportion' : 'a broken proportion, with the ring either inside the horizon or impossibly far outside it'}.`}
            dataView={<DataTable caption="Black hole measurements at your current π" rows={[
              ['Horizon area vs. real', Number.isFinite(horizonArea) ? `${((horizonArea / realHorizonArea) * 100).toFixed(1)}%` : '—'],
              ['Photon sphere circumference', Number.isFinite(photonCirc) ? photonCirc.toFixed(3) : '—'],
              ['Hawking temp (10 M☉)', Number.isFinite(hawkingTemp) ? `${(hawkingTemp * 1e9).toExponential(2)} nK` : '—'],
              ['Real-π Hawking temp', `${(realHawkingTemp * 1e9).toExponential(2)} nK`],
            ]} />}
          >
            <CanvasErrorBoundary>
              <Canvas camera={{ position: [0, 1.5, 5], fov: 45 }}>
                <ambientLight intensity={0.15} />
                <pointLight position={[4, 3, 4]} intensity={1.5} color="#7c9eff" />
                <EventHorizon p={p} />
                <PhotonSphere p={p} />
                <OrbitControls enablePan={false} />
              </Canvas>
            </CanvasErrorBoundary>
          </ExhibitFrame>
        )}
      </div>

      <div className="glass" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <h3 className="display" style={{ margin: 0, fontSize: '18px' }}>Black Holes</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
          A = 4p·r² &nbsp;·&nbsp; T = ħc³ / (8p·G·M·k<sub>B</sub>)
        </p>
        <Row label="Horizon area vs. real" value={Number.isFinite(horizonArea) ? `${((horizonArea / realHorizonArea) * 100).toFixed(1)}%` : '—'} />
        <Row label="Photon sphere circumference" value={Number.isFinite(photonCirc) ? photonCirc.toFixed(3) : '—'} />
        <Row label="Hawking temp (10 M☉)" value={Number.isFinite(hawkingTemp) ? `${(hawkingTemp * 1e9).toExponential(2)} nK` : '—'} />
        <Row label="Real-π Hawking temp" value={`${(realHawkingTemp * 1e9).toExponential(2)} nK`} />
        <div style={{
          marginTop: '6px', padding: '12px 14px', borderRadius: 'var(--radius-sm)',
          background: stable ? 'rgba(107,255,176,0.08)' : 'rgba(255,107,107,0.08)',
          border: `1px solid ${stable ? 'rgba(107,255,176,0.3)' : 'rgba(255,107,107,0.3)'}`,
        }}>
          <strong style={{ fontSize: '13px', color: stable ? 'var(--success)' : 'var(--danger)' }}>
            {stable ? '✓ Horizon geometry remains coherent' : '✕ Horizon geometry breaks down'}
          </strong>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '6px 0 0' }}>
            {stable
              ? 'The event horizon and photon sphere stay in a sensible relative proportion — a self-consistent alternate general relativity could plausibly define black holes this way.'
              : 'The photon sphere either collapses inside the horizon or flies impossibly far outside it — this exact geometric relationship could not describe a real black hole in a universe built on our physics.'}
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
