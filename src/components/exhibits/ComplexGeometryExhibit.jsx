import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Line } from '@react-three/drei';
import * as THREE from 'three';
import { useRealityStore } from '../../state/useRealityStore.js';
import CanvasErrorBoundary from '../ui/CanvasErrorBoundary.jsx';
import { generateComplexSpiral, classifyComplexBehavior } from '../../engines/geometry/generateComplexSpiral.js';

function SpiralLine({ p }) {
  const { points } = useMemo(() => generateComplexSpiral(p), [p]);
  const vecs = useMemo(() => points.map(([x, y, z]) => new THREE.Vector3(x, y, z)), [points]);
  const ref = useRef();
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.z += dt * 0.15; });
  return (
    <group ref={ref}>
      <Line points={vecs} color="#7c9eff" lineWidth={2} />
      {vecs.filter((_, i) => i % 20 === 0).map((v, i) => (
        <mesh key={i} position={v}>
          <sphereGeometry args={[0.035, 12, 12]} />
          <meshStandardMaterial color="#ffb37c" />
        </mesh>
      ))}
    </group>
  );
}

export default function ComplexGeometryExhibit() {
  const parsed = useRealityStore((s) => s.parsed);
  const isComplex = parsed.kind === 'complex';
  const p = isComplex ? parsed.complex : { re: 0, im: 0 };

  // Depend on the primitive re/im values, not the object reference, since
  // a new { re: 0, im: 0 } literal is created every render when isComplex
  // is false — memoizing on that reference would never actually memoize.
  // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally depending on primitives, not the object reference; see comment above
  const behavior = useMemo(() => classifyComplexBehavior(p), [p.re, p.im]);

  return (
    <section className="grid-2col">
      <div className="glass" style={{ height: '420px', overflow: 'hidden' }}>
        {!isComplex ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '24px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '380px' }}>
              Enter a complex value for π (try <code>2+3i</code> in the console above) to activate
              this exhibit — it visualizes π as a complex frequency instead of a real turn angle.
            </p>
          </div>
        ) : (
          <CanvasErrorBoundary>
            <Canvas camera={{ position: [4, 2, 4], fov: 45 }}>
              <ambientLight intensity={0.7} />
              <directionalLight position={[4, 4, 4]} intensity={1} />
              <SpiralLine p={p} />
              <OrbitControls enablePan={false} />
            </Canvas>
          </CanvasErrorBoundary>
        )}
      </div>

      <div className="glass" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <h3 className="display" style={{ margin: 0, fontSize: '18px' }}>🌀 Complex Geometry</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
          z(t) = r · e<sup>i·p·t</sup> = r · e<sup>−b·t</sup>·(cos(a·t) + i·sin(a·t))
        </p>
        <Row label="Real part (rotation rate)" value={isComplex ? p.re.toFixed(4) : '—'} />
        <Row label="Imaginary part (decay rate)" value={isComplex ? p.im.toFixed(4) : '—'} />
        <div style={{
          marginTop: '6px', padding: '12px 14px', borderRadius: 'var(--radius-sm)',
          background: 'rgba(124,158,255,0.08)', border: '1px solid rgba(124,158,255,0.3)',
        }}>
          <strong style={{ fontSize: '13px', color: 'var(--accent)' }}>
            {isComplex ? `Behavior: ${behavior}` : 'Waiting for complex input'}
          </strong>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '6px 0 0' }}>
            A complex π has no literal circle to draw — real-world geometric interpretation ends
            here. What you're seeing instead is a genuine mathematical generalization: treating π
            as a <em>complex frequency</em>, exactly as engineers do in control theory and signal
            processing (s = σ + iω). The spiral's rotation comes from π's real part; its growth or
            decay comes from π's imaginary part. This is imaginative extrapolation, clearly
            labeled as such — not a claim about physical reality.
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
