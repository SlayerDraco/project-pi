import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import { useRealityStore } from '../../state/useRealityStore.js';
import CanvasErrorBoundary from '../ui/CanvasErrorBoundary.jsx';
import ExhibitFrame from '../ui/ExhibitFrame.jsx';
import DataTable from '../ui/DataTable.jsx';
import { generateCircleGeometry, generateRingOutline, adaptiveSegments } from '../../engines/geometry/generateCircle.js';
import { Geometry } from '../../engines/math/formulas.js';
import { REAL_PI } from '../../engines/math/parser.js';

const WHEEL_RADIUS = 0.8;

/**
 * The wheel's rolling motion (rotation angle -> forward distance = r·θ) is
 * real rolling-without-slipping physics and does NOT depend on p. What
 * DOES depend on p is the wheel's actual shape: it's built from
 * generateCircleGeometry using the experimental π, so a non-real π produces
 * a wheel that isn't circular — and you can see it bump/skid along the
 * track as it "rolls," since its silhouette doesn't match the distance
 * a true circle of the same radius would cover.
 */
function RollingWheel({ p }) {
  const geo = useMemo(() => generateCircleGeometry(WHEEL_RADIUS, p, adaptiveSegments(p, 64)), [p]);
  const outline = useMemo(() => generateRingOutline(WHEEL_RADIUS, p, adaptiveSegments(p, 64)), [p]);
  const ref = useRef();
  const angle = useRef(0);

  useFrame((_, dt) => {
    angle.current += dt * 1.2;
    if (ref.current) {
      ref.current.rotation.z = -angle.current;
      const x = ((angle.current * WHEEL_RADIUS) % 8) - 4; // real rolling distance = r·θ
      ref.current.position.x = x;
    }
  });

  return (
    <group ref={ref} position={[-4, WHEEL_RADIUS, 0]}>
      <mesh geometry={geo}>
        <meshStandardMaterial color="#7c9eff" side={2} />
      </mesh>
      <Line points={outline} color="#ffffff" lineWidth={1.5} />
    </group>
  );
}

function Track() {
  const points = useMemo(() => [new THREE.Vector3(-5, 0, 0), new THREE.Vector3(5, 0, 0)], []);
  return <Line points={points} color="#3a3a45" lineWidth={2} />;
}

export default function TransportationExhibit() {
  const parsed = useRealityStore((s) => s.parsed);
  const p = parsed.kind === 'real' ? parsed.value : parsed.kind === 'infinite' ? parsed.value : REAL_PI;

  const distancePerRevolution = Geometry.circleCircumference(WHEEL_RADIUS, p);
  const realDistancePerRevolution = Geometry.circleCircumference(WHEEL_RADIUS, REAL_PI);
  const mismatch = Number.isFinite(distancePerRevolution)
    ? Math.abs(distancePerRevolution - realDistancePerRevolution) / realDistancePerRevolution
    : 1;

  const rollsSmoothly = mismatch < 0.05;

  const dataRows = [
    ["Wheel's implied distance/revolution", Number.isFinite(distancePerRevolution) ? `${distancePerRevolution.toFixed(3)} units` : '—'],
    ['Actual rolling distance/revolution (real physics)', `${realDistancePerRevolution.toFixed(3)} units`],
    ['Shape mismatch', `${(mismatch * 100).toFixed(1)}%`],
    ['Rolls smoothly', rollsSmoothly ? 'Yes' : 'No — visible bump/skid'],
  ];

  return (
    <section className="grid-2col">
      <div className="glass" style={{ height: '420px', overflow: 'hidden' }}>
        {parsed.kind === 'complex' ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '24px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '360px' }}>
              A complex π gives the wheel an imaginary silhouette — there's no rollable shape to
              simulate.
            </p>
          </div>
        ) : (
          <ExhibitFrame
            visualLabel="A wheel rolling along a horizontal track. The wheel's outline is generated from your pi value, so it may not be perfectly round — watch for bumping or skidding as it rolls."
            dataView={<DataTable caption="Transportation measurements at your current π" rows={dataRows} />}
          >
            <CanvasErrorBoundary>
              <Canvas camera={{ position: [0, 2, 8], fov: 45 }}>
                <ambientLight intensity={0.6} />
                <directionalLight position={[3, 5, 3]} intensity={1} />
                <Track />
                <RollingWheel p={p} />
              </Canvas>
            </CanvasErrorBoundary>
          </ExhibitFrame>
        )}
      </div>

      <div className="glass" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <h3 className="display" style={{ margin: 0, fontSize: '18px' }}>🚗 Transportation</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
          Wheel circumference = 2p·r &nbsp;·&nbsp; Real rolling distance = r·θ (independent of p)
        </p>
        <Row label="Wheel's implied distance/rev" value={Number.isFinite(distancePerRevolution) ? distancePerRevolution.toFixed(3) : '—'} />
        <Row label="Actual rolling distance/rev" value={realDistancePerRevolution.toFixed(3)} />
        <div style={{
          marginTop: '6px', padding: '12px 14px', borderRadius: 'var(--radius-sm)',
          background: rollsSmoothly ? 'rgba(107,255,176,0.08)' : 'rgba(255,107,107,0.08)',
          border: `1px solid ${rollsSmoothly ? 'rgba(107,255,176,0.3)' : 'rgba(255,107,107,0.3)'}`,
        }}>
          <strong style={{ fontSize: '13px', color: rollsSmoothly ? 'var(--success)' : 'var(--danger)' }}>
            {rollsSmoothly ? '✓ Wheels roll smoothly' : '✕ Wheels bump and skid'}
          </strong>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '6px 0 0' }}>
            The wheel's rolling motion (distance = radius × angle turned) is real physics and
            never changes. What changes is the wheel's actual shape, built from your π — {rollsSmoothly
              ? 'here it stays close enough to circular that rolling looks natural.'
              : "here it's visibly non-circular, so as it turns it doesn't advance a consistent distance — wheeled transportation as we know it would be impractical."}
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
