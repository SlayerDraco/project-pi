import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Line } from '@react-three/drei';
import { useRealityStore } from '../../state/useRealityStore.js';
import CanvasErrorBoundary from '../ui/CanvasErrorBoundary.jsx';
import ExhibitFrame from '../ui/ExhibitFrame.jsx';
import DataTable from '../ui/DataTable.jsx';
import { generateCircleGeometry, generateRingOutline, generateSphereGeometry, adaptiveSegments } from '../../engines/geometry/generateCircle.js';
import { Geometry } from '../../engines/math/formulas.js';
import { REAL_PI } from '../../engines/math/parser.js';

const RADIUS = 1.6;

function CircleMesh({ p }) {
  const geo = useMemo(() => generateCircleGeometry(RADIUS, p), [p]);
  const ring = useMemo(() => generateRingOutline(RADIUS, p), [p]);
  
  return (
    <group>
      <mesh geometry={geo}>
        <meshStandardMaterial color="#7c9eff" side={2} transparent opacity={0.55} />
      </mesh>
      <Line 
        // Wrap the array here
        points={Array.from(ring.attributes.position.array)} 
        color="#ffffff" 
        lineWidth={1.5} 
      />
    </group>
  );
}


function SphereMesh({ p }) {
  const geo = useMemo(() => generateSphereGeometry(RADIUS, p, adaptiveSegments(p, 48), adaptiveSegments(p, 32)), [p]);
  const ref = useRef();
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.y += dt * 0.25; });
  return (
    <mesh geometry={geo} ref={ref} position={[3.6, 0, 0]}>
      <meshStandardMaterial color="#ffb37c" roughness={0.4} metalness={0.1} />
    </mesh>
  );
}

export default function CircleSphereExhibit() {
  const parsed = useRealityStore((s) => s.parsed);
  const p = parsed.kind === 'real' ? parsed.value : parsed.kind === 'infinite' ? Number.MAX_SAFE_INTEGER * Math.sign(parsed.value || 1) : REAL_PI;

  const circumference = Geometry.circleCircumference(RADIUS, p);
  const area = Geometry.circleArea(RADIUS, p);
  const sphereVol = Geometry.sphereVolume(RADIUS, p);
  const realCircumference = Geometry.circleCircumference(RADIUS, REAL_PI);

  return (
    <section className="grid-2col">
      <div className="glass" style={{ height: '420px', overflow: 'hidden', position: 'relative' }}>
        {parsed.kind === 'complex' ? (
          <ComplexNotice />
        ) : (
          <ExhibitFrame
            visualLabel={`A translucent blue disk and an orange sphere, both built from your current pi value. A white outline traces the disk's edge${Number.isFinite(p) && Math.abs(p - REAL_PI) > 0.01 ? ' and visibly fails to close into a perfect ring' : ' and closes into a perfect ring'}.`}
            dataView={<DataTable caption="Geometry measurements at your current π" rows={[
              ['Circumference', Number.isFinite(circumference) ? `${circumference.toFixed(4)} units` : (circumference > 0 ? '+∞' : '−∞')],
              ['Area', Number.isFinite(area) ? `${area.toFixed(4)} units²` : (area > 0 ? '+∞' : '−∞')],
              ['Sphere volume', Number.isFinite(sphereVol) ? `${sphereVol.toFixed(4)} units³` : (sphereVol > 0 ? '+∞' : '−∞')],
              ['Real-π circumference (reference)', `${realCircumference.toFixed(4)} units`],
            ]} />}
          >
            <CanvasErrorBoundary>
              <Canvas camera={{ position: [0, 1.5, 6], fov: 45 }}>
                <ambientLight intensity={0.6} />
                <directionalLight position={[5, 5, 5]} intensity={1.2} />
                <CircleMesh p={p} />
                <SphereMesh p={p} />
                <OrbitControls enablePan={false} />
              </Canvas>
            </CanvasErrorBoundary>
          </ExhibitFrame>
        )}
      </div>

      <div className="glass" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <h3 className="display" style={{ margin: 0, fontSize: '18px' }}>Circles &amp; Spheres</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
          C = 2·p·r &nbsp;·&nbsp; A = p·r² &nbsp;·&nbsp; V = (4/3)·p·r³
        </p>
        <Stat label="Circumference" value={circumference} unit="units" />
        <Stat label="Area" value={area} unit="units²" />
        <Stat label="Sphere Volume" value={sphereVol} unit="units³" />
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
          At the real π, this circle's circumference is {realCircumference.toFixed(4)}. Watch the ring outline —
          it visibly fails to close when p deviates from π, because a "full turn" here is literally defined as 2p radians.
        </p>
      </div>
    </section>
  );
}

function Stat({ label, value, unit }) {
  const display = Number.isFinite(value) ? value.toFixed(4) : (value > 0 ? '+∞' : '−∞');
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
      <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ fontFamily: 'monospace' }}>{display} {unit}</span>
    </div>
  );
}

function ComplexNotice() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '24px', textAlign: 'center' }}>
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '360px' }}>
        A complex π has no real-valued circumference or area — real-world circle
        geometry stops applying here. This is where Complex Geometry mode takes over
        (see the Complex Geometry exhibit) instead of a literal circle render.
      </p>
    </div>
  );
}
