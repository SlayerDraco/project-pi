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

const EARTH_RADIUS_KM = 6371;
const DISPLAY_RADIUS = 1.6;
const EARTH_ORBIT_RADIUS_KM = 149_600_000; // 1 AU
const SUN_GM = 1.327e11; // km^3/s^2 (real, held constant — orbit period is what changes)

function Planet({ p }) {
  const geo = useMemo(() => generateSphereGeometry(DISPLAY_RADIUS, p, adaptiveSegments(p, 64), adaptiveSegments(p, 40)), [p]);
  const ref = useRef();
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.y += dt * 0.15; });
  return (
    <mesh geometry={geo} ref={ref}>
      <meshStandardMaterial color="#4d7cff" roughness={0.6} metalness={0.05} emissive="#0a1a3a" emissiveIntensity={0.3} />
    </mesh>
  );
}

function OrbitRing({ p }) {
  const points = useMemo(() => generateRingOutline(2.8, p, 200), [p]);
  return <Line points={points.attributes.position.array} color="#ffb37c" lineWidth={1} transparent opacity={0.6} />;
}

export default function EarthExhibit() {
  const parsed = useRealityStore((s) => s.parsed);
  const p = parsed.kind === 'real' ? parsed.value : parsed.kind === 'infinite' ? parsed.value : REAL_PI;

  const volume = Astronomy.planetVolume(EARTH_RADIUS_KM, p);
  const realVolume = Astronomy.planetVolume(EARTH_RADIUS_KM, REAL_PI);
  const volumeRatio = volume / realVolume;

  const orbitPeriodSeconds = Astronomy.orbitalPeriod(EARTH_ORBIT_RADIUS_KM, SUN_GM, p);
  const orbitPeriodDays = orbitPeriodSeconds / 86400;
  const realOrbitDays = Astronomy.orbitalPeriod(EARTH_ORBIT_RADIUS_KM, SUN_GM, REAL_PI) / 86400;

  const survivable = Number.isFinite(p) && p > 2.6 && p < 3.6;

  return (
    <section className="grid-2col">
      <div className="glass" style={{ height: '420px', overflow: 'hidden' }}>
        <ExhibitFrame
          visualLabel="A rotating blue planet with an orange orbit ring around it, both generated from your current pi value."
          dataView={<DataTable caption="Astronomy measurements at your current π" rows={[
            ['Planet volume vs. real Earth', `${(volumeRatio * 100).toFixed(1)}%`],
            ['Year length', `${orbitPeriodDays.toFixed(1)} days`],
            ['Real-Earth year (reference)', `${realOrbitDays.toFixed(1)} days`],
          ]} />}
        >
          <CanvasErrorBoundary>
            <Canvas camera={{ position: [0, 2, 7], fov: 45 }}>
              <ambientLight intensity={0.4} />
              <pointLight position={[6, 4, 6]} intensity={2} color="#fff2d8" />
              <Planet p={p} />
              <OrbitRing p={p} />
              <OrbitControls enablePan={false} />
            </Canvas>
          </CanvasErrorBoundary>
        </ExhibitFrame>
      </div>

      <div className="glass" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <h3 className="display" style={{ margin: 0, fontSize: '18px' }}>Earth &amp; Orbit</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
          V = (4/3)·p·r³ &nbsp;·&nbsp; T = 2p·√(a³/GM)
        </p>
        <Row label="Planet Volume vs. real Earth" value={`${(volumeRatio * 100).toFixed(1)}%`} />
        <Row label="Year Length" value={`${orbitPeriodDays.toFixed(1)} days`} />
        <Row label="Real-Earth Year" value={`${realOrbitDays.toFixed(1)} days`} />
        <div style={{
          marginTop: '6px', padding: '12px 14px', borderRadius: 'var(--radius-sm)',
          background: survivable ? 'rgba(107,255,176,0.08)' : 'rgba(255,107,107,0.08)',
          border: `1px solid ${survivable ? 'rgba(107,255,176,0.3)' : 'rgba(255,107,107,0.3)'}`,
        }}>
          <strong style={{ fontSize: '13px', color: survivable ? 'var(--success)' : 'var(--danger)' }}>
            {survivable ? '✓ Plausibly survivable' : '✕ Our universe would not survive this'}
          </strong>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '6px 0 0' }}>
            {survivable
              ? 'Orbital mechanics and planetary volume stay within a range where a self-consistent alternate universe could plausibly evolve similar structures.'
              : 'At this deviation, orbital periods, planetary density, and structural geometry diverge so far from real Earth that Earth-like planets and stable orbits become mathematically implausible in a universe built on our physical constants.'}
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
