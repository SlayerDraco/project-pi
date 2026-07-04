import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useRealityStore } from '../../state/useRealityStore.js';
import CanvasErrorBoundary from '../ui/CanvasErrorBoundary.jsx';
import ExhibitFrame from '../ui/ExhibitFrame.jsx';
import DataTable from '../ui/DataTable.jsx';
import { GlowFrame } from '../ui/SceneEffects.jsx';
import Starfield from '../ui/Starfield.jsx';
import { generateGalaxyWithColor } from '../../engines/astronomy/generateGalaxy.js';
import { REAL_PI } from '../../engines/math/parser.js';
import { StatGrid, StatCard, VerdictBanner } from '../ui/StatCard.jsx';

function GalaxyPoints({ p }) {
  const { positions, colors } = useMemo(() => generateGalaxyWithColor(p), [p]);
  const ref = useRef();
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.z += dt * 0.05; });
  return (
    <group ref={ref}>
      <Points positions={positions} colors={colors} stride={3}>
        <PointMaterial
          size={0.06}
          vertexColors
          transparent
          opacity={0.95}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>
      {/* Galactic bulge — a bright glowing core instead of empty center */}
      <mesh>
        <sphereGeometry args={[0.35, 24, 24]} />
        <meshBasicMaterial color="#fff3d6" transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.7, 24, 24]} />
        <meshBasicMaterial color="#ffdca0" transparent opacity={0.28} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
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
      <div className="glass" style={{ height: '460px', overflow: 'hidden' }}>
        {parsed.kind === 'complex' ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '24px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '360px' }}>
              A complex π gives spiral arms an imaginary winding rate — no real galaxy shape
              exists here.
            </p>
          </div>
        ) : (
          <ExhibitFrame
            visualLabel={`A glowing spiral galaxy with a bright golden core, made of blue-white and violet star points across three arms, winding ${coherent ? 'in a coherent, recognizable spiral pattern' : 'so tightly or loosely that the arms overlap or barely spiral at all'}, slowly rotating.`}
            dataView={<DataTable caption="Galaxy measurements at your current π" rows={dataRows} />}
          >
            <CanvasErrorBoundary>
              <GlowFrame tint="rgba(180,170,255,0.14)">
                <Canvas camera={{ position: [0, 5, 6], fov: 50 }}>
                  <color attach="background" args={['#020204']} />
                  <ambientLight intensity={0.15} />
                  <Starfield count={500} radius={20} />
                  <GalaxyPoints p={p} />
                  <OrbitControls enablePan={false} />
                </Canvas>
              </GlowFrame>
            </CanvasErrorBoundary>
          </ExhibitFrame>
        )}
      </div>

      <div className="glass" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <h3 className="display" style={{ margin: 0, fontSize: '19px' }}>🌌 Galaxies</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', margin: '4px 0 0' }}>
            Logarithmic spiral: r = a·e<sup>bθ</sup>, θ swept across 2p-radian turns
          </p>
        </div>
        <StatGrid>
          <StatCard icon="🌀" label="Arm separation" value={Number.isFinite(armSeparation) ? armSeparation.toFixed(2) : '—'} unit="rad" />
          <StatCard icon="🪞" label="Real-π separation" value={realArmSeparation.toFixed(2)} unit="rad" />
        </StatGrid>
        <VerdictBanner good={coherent} title={coherent ? 'Recognizable spiral structure' : 'Spiral structure degenerates'}>
          {coherent
            ? 'The three arms stay distinct and legible — a self-consistent alternate astrophysics could plausibly form galaxies shaped like this.'
            : "At this deviation the arms either wind so tightly they overlap into a solid disk, or unwind so loosely they barely curve at all — the elegant spiral structure real galaxies display wouldn't emerge."}
        </VerdictBanner>
      </div>
    </section>
  );
}
