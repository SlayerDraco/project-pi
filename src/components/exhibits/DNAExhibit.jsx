import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useRealityStore } from '../../state/useRealityStore.js';
import CanvasErrorBoundary from '../ui/CanvasErrorBoundary.jsx';
import ExhibitFrame from '../ui/ExhibitFrame.jsx';
import DataTable from '../ui/DataTable.jsx';
import { GlowFrame } from '../ui/SceneEffects.jsx';
import { generateDNAHelix } from '../../engines/biology/generateDNA.js';
import { Biology } from '../../engines/math/formulas.js';
import { REAL_PI } from '../../engines/math/parser.js';
import { StatGrid, StatCard, VerdictBanner } from '../ui/StatCard.jsx';

const BASE_COLORS = ['#ff6b8b', '#5ce6e6', '#ffd166', '#8b7cff'];

function StrandTube({ points, color }) {
  const geometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(points);
    return new THREE.TubeGeometry(curve, 220, 0.055, 10, false);
  }, [points]);
  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color={color} roughness={0.3} metalness={0.25} emissive={color} emissiveIntensity={0.25} />
    </mesh>
  );
}

function Rung({ a, b, color }) {
  const { mid, length, quaternion } = useMemo(() => {
    const dir = new THREE.Vector3().subVectors(b, a);
    const len = dir.length();
    const midpoint = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    return { mid: midpoint, length: len, quaternion: quat };
  }, [a, b]);
  return (
    <mesh position={mid} quaternion={quaternion}>
      <cylinderGeometry args={[0.032, 0.032, length, 8]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} roughness={0.4} />
    </mesh>
  );
}

function Helix({ p }) {
  const { strandA, strandB, rungs } = useMemo(() => generateDNAHelix(p), [p]);
  const groupRef = useRef();
  useFrame((_, dt) => { if (groupRef.current) groupRef.current.rotation.y += dt * 0.2; });
  return (
    <group ref={groupRef}>
      <StrandTube points={strandA} color="#7c9eff" />
      <StrandTube points={strandB} color="#ff9d7c" />
      {rungs.map((pair, i) => (
        <Rung key={i} a={pair[0]} b={pair[1]} color={BASE_COLORS[i % BASE_COLORS.length]} />
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
      <div className="glass" style={{ height: '460px', overflow: 'hidden' }}>
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
              <GlowFrame tint="rgba(124,158,255,0.14)">
                <Canvas camera={{ position: [4, 0, 4], fov: 45 }}>
                  <color attach="background" args={['#050510']} />
                  <ambientLight intensity={0.5} />
                  <directionalLight position={[4, 4, 4]} intensity={1.4} color="#fff2e0" />
                  <pointLight position={[-4, -2, -4]} intensity={0.6} color="#7c9eff" />
                  <Helix p={p} />
                  <OrbitControls enablePan={false} autoRotate autoRotateSpeed={1.2} />
                </Canvas>
              </GlowFrame>
            </CanvasErrorBoundary>
          </ExhibitFrame>
        )}
      </div>

      <div className="glass" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <h3 className="display" style={{ margin: 0, fontSize: '19px' }}>🧬 DNA &amp; Cells</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', margin: '4px 0 0' }}>
            Winding angle per base pair = 2p / 10.5 &nbsp;·&nbsp; Cell volume = (4/3)·p·r³
          </p>
        </div>
        <StatGrid>
          <StatCard icon="🌀" label="Twist / base pair" value={Number.isFinite(turnPerBase) ? turnPerBase.toFixed(3) : '—'} unit="rad" />
          <StatCard icon="🧫" label="Cell volume" value={Number.isFinite(cellVolume) ? `${((cellVolume / realCellVolume) * 100).toFixed(0)}%` : '—'} sub="vs. real" />
        </StatGrid>
        <VerdictBanner good={viable} title={viable ? 'Plausibly viable biochemistry' : 'Molecular geometry breaks down'}>
          {viable
            ? 'The helix winds tightly enough to plausibly support hydrogen-bonded base pairing in an alternate-physics universe built around this constant.'
            : 'At this deviation the helix either unwinds into a near-straight ladder or overwinds into a impossibly tight coil — real base-pair bonding geometry could not hold together.'}
        </VerdictBanner>
      </div>
    </section>
  );
}
