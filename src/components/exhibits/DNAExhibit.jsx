import { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Line } from '@react-three/drei';
import { useRealityStore } from '../../state/useRealityStore.js';
import CanvasErrorBoundary from '../ui/CanvasErrorBoundary.jsx';
import ExhibitFrame from '../ui/ExhibitFrame.jsx';
import DataTable from '../ui/DataTable.jsx';
import { generateDNAHelix } from '../../engines/biology/generateDNA.js';
import { Biology } from '../../engines/math/formulas.js';
import { REAL_PI } from '../../engines/math/parser.js';

function Helix({ p }) {
  const { strandA, strandB, rungs } = useMemo(() => generateDNAHelix(p), [p]);
  return (
    <group>
      <Line points={strandA} color="#7c9eff" lineWidth={2} />
      <Line points={strandB} color="#ffb37c" lineWidth={2} />
      {rungs.map((pair, i) => (
        <Line key={i} points={pair} color="#5a5a66" lineWidth={1} />
      ))}
    </group>
  );
}

export default function DNAExhibit() {
  const parsed = useRealityStore((s) => s.parsed);
  const p = parsed.kind === 'real' ? parsed.value : parsed.kind === 'infinite' ? parsed.value : REAL_PI;

  const { turnPerBase } = useMemo(() => generateDNAHelix(p), [p]);
  const realTurnPerBase = (2 * REAL_PI) / 10.5;
  const cellVolume = Biology.cellSphereVolume(5, p); // µm³, radius ~5µm typical cell
  const realCellVolume = Biology.cellSphereVolume(5, REAL_PI);

  const viable = Number.isFinite(p) && p > 2.4 && p < 3.9;

  return (
    <section className="grid-2col">
      <div className="glass" style={{ height: '420px', overflow: 'hidden' }}>
        {parsed.kind === 'complex' ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '24px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '360px' }}>
              A complex π gives the helix's winding angle an imaginary component — there's no
              literal 3D strand to draw. Biology stops being physically meaningful here.
            </p>
          </div>
        ) : (
          <ExhibitFrame
            visualLabel={`A rotating DNA double helix made of two colored strands connected by rungs, wound ${viable ? 'in a biologically plausible tight spiral' : 'either far too loosely or far too tightly to represent real base pairing'}.`}
            dataView={<DataTable caption="DNA & Cell measurements at your current π" rows={[
              ['Twist / base pair', Number.isFinite(turnPerBase) ? `${turnPerBase.toFixed(4)} rad` : '—'],
              ['Real-Earth twist / base pair', `${realTurnPerBase.toFixed(4)} rad`],
              ['Cell volume vs. real', Number.isFinite(cellVolume) ? `${((cellVolume / realCellVolume) * 100).toFixed(1)}%` : '—'],
            ]} />}
          >
            <CanvasErrorBoundary>
              <Canvas camera={{ position: [4, 0, 4], fov: 45 }}>
                <ambientLight intensity={0.7} />
                <directionalLight position={[4, 4, 4]} intensity={1} />
                <Helix p={p} />
                <OrbitControls enablePan={false} autoRotate autoRotateSpeed={1.2} />
              </Canvas>
            </CanvasErrorBoundary>
          </ExhibitFrame>
        )}
      </div>

      <div className="glass" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <h3 className="display" style={{ margin: 0, fontSize: '18px' }}>🧬 DNA &amp; Cells</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
          Winding angle per base pair = 2p / 10.5 &nbsp;·&nbsp; Cell volume = (4/3)·p·r³
        </p>
        <Row label="Twist / base pair" value={Number.isFinite(turnPerBase) ? `${turnPerBase.toFixed(4)} rad` : '—'} />
        <Row label="Real-Earth twist / base pair" value={`${realTurnPerBase.toFixed(4)} rad`} />
        <Row label="Cell volume vs. real" value={Number.isFinite(cellVolume) ? `${((cellVolume / realCellVolume) * 100).toFixed(1)}%` : '—'} />
        <div style={{
          marginTop: '6px', padding: '12px 14px', borderRadius: 'var(--radius-sm)',
          background: viable ? 'rgba(107,255,176,0.08)' : 'rgba(255,107,107,0.08)',
          border: `1px solid ${viable ? 'rgba(107,255,176,0.3)' : 'rgba(255,107,107,0.3)'}`,
        }}>
          <strong style={{ fontSize: '13px', color: viable ? 'var(--success)' : 'var(--danger)' }}>
            {viable ? '✓ Plausibly viable biochemistry' : '✕ Molecular geometry breaks down'}
          </strong>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '6px 0 0' }}>
            {viable
              ? 'The helix winds tightly enough to plausibly support hydrogen-bonded base pairing in an alternate-physics universe built around this constant.'
              : 'At this deviation the helix either unwinds into a near-straight ladder or overwinds into a impossibly tight coil — real base-pair bonding geometry could not hold together.'}
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
