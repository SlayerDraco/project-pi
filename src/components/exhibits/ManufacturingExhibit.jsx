import { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import { useRealityStore } from '../../state/useRealityStore.js';
import CanvasErrorBoundary from '../ui/CanvasErrorBoundary.jsx';
import ExhibitFrame from '../ui/ExhibitFrame.jsx';
import DataTable from '../ui/DataTable.jsx';
import { generateThreadHelix } from '../../engines/manufacturing/generateThread.js';
import { Engineering } from '../../engines/math/formulas.js';
import { REAL_PI } from '../../engines/math/parser.js';
import { useKeyboardOrbit } from '../../hooks/useKeyboardOrbit.js';

const RADIUS = 0.6;
const PITCH = 0.35;
const TURNS = 6;

function Thread({ p }) {
  const points = useMemo(() => generateThreadHelix(p, { radius: RADIUS, pitch: PITCH, turns: TURNS }), [p]);
  const ref = useKeyboardOrbit(1.4);
  return (
    <group ref={ref}>
      <Line points={points} color="#7c9eff" lineWidth={2.5} />
      <mesh>
        <cylinderGeometry args={[RADIUS * 0.7, RADIUS * 0.7, TURNS * PITCH, 32]} />
        <meshStandardMaterial color="#1a1a22" roughness={0.7} metalness={0.3} />
      </mesh>
    </group>
  );
}

export default function ManufacturingExhibit() {
  const parsed = useRealityStore((s) => s.parsed);
  const p = parsed.kind === 'real' ? parsed.value : parsed.kind === 'infinite' ? parsed.value : REAL_PI;

  const threadLength = Engineering.boltThreadHelixLength(RADIUS, PITCH, TURNS, p);
  const realThreadLength = Engineering.boltThreadHelixLength(RADIUS, PITCH, TURNS, REAL_PI);
  const pipeArea = Engineering.pipeFlowArea(1, p);
  const realPipeArea = Engineering.pipeFlowArea(1, REAL_PI);

  const manufacturable = Number.isFinite(p) && p > 2 && p < 5;

  const dataRows = [
    ['Unwound thread length', Number.isFinite(threadLength) ? `${threadLength.toFixed(3)} units` : '—'],
    ['Real-π thread length', `${realThreadLength.toFixed(3)} units`],
    ['Pipe flow area (r=1)', Number.isFinite(pipeArea) ? `${pipeArea.toFixed(3)} units²` : '—'],
    ['Real-π pipe flow area', `${realPipeArea.toFixed(3)} units²`],
    ['Manufacturable with standard tooling', manufacturable ? 'Yes' : 'No'],
  ];

  return (
    <section className="grid-2col">
      <div className="glass" style={{ height: '420px', overflow: 'hidden' }}>
        {parsed.kind === 'complex' ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '24px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '360px' }}>
              A complex π gives thread pitch an imaginary winding — no physical bolt could be
              machined this way.
            </p>
          </div>
        ) : (
          <ExhibitFrame
            visualLabel="A bolt with a helical thread wound around its shaft, whose tightness changes with pi. Use arrow keys to rotate."
            dataView={<DataTable caption="Manufacturing measurements at your current π" rows={dataRows} />}
          >
            <CanvasErrorBoundary>
              <Canvas camera={{ position: [3, 1, 3], fov: 45 }}>
                <ambientLight intensity={0.6} />
                <directionalLight position={[4, 4, 4]} intensity={1.1} />
                <Thread p={p} />
              </Canvas>
            </CanvasErrorBoundary>
          </ExhibitFrame>
        )}
      </div>

      <div className="glass" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <h3 className="display" style={{ margin: 0, fontSize: '18px' }}>Manufacturing</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
          Thread length = turns·√((2p·r)² + pitch²) &nbsp;·&nbsp; Pipe area = p·r²
        </p>
        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>
          Keyboard users: use arrow keys over the visual to rotate the bolt.
        </p>
        <Row label="Thread length" value={Number.isFinite(threadLength) ? threadLength.toFixed(3) : '—'} />
        <Row label="Real-π thread length" value={realThreadLength.toFixed(3)} />
        <div style={{
          marginTop: '6px', padding: '12px 14px', borderRadius: 'var(--radius-sm)',
          background: manufacturable ? 'rgba(107,255,176,0.08)' : 'rgba(255,107,107,0.08)',
          border: `1px solid ${manufacturable ? 'rgba(107,255,176,0.3)' : 'rgba(255,107,107,0.3)'}`,
        }}>
          <strong style={{ fontSize: '13px', color: manufacturable ? 'var(--success)' : 'var(--danger)' }}>
            {manufacturable ? '✓ Thread stays machinable' : '✕ Thread geometry fails'}
          </strong>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '6px 0 0' }}>
            {manufacturable
              ? 'The thread pitch and helix angle stay within a range a real lathe or die could still cut.'
              : 'The helix winds so tightly (or so loosely) that no standard threading tool could cut it — nuts and bolts as fasteners would not exist in a universe built this way.'}
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
