import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useRealityStore } from '../../state/useRealityStore.js';
import CanvasErrorBoundary from '../ui/CanvasErrorBoundary.jsx';
import ExhibitFrame from '../ui/ExhibitFrame.jsx';
import DataTable from '../ui/DataTable.jsx';
import { GlowFrame } from '../ui/SceneEffects.jsx';
import Starfield from '../ui/Starfield.jsx';
import { generateSphereGeometry, adaptiveSegments } from '../../engines/geometry/generateCircle.js';
import { AccretionDisk } from '../../engines/astronomy/AccretionDisk.jsx';
import { Astronomy } from '../../engines/math/formulas.js';
import { REAL_PI } from '../../engines/math/parser.js';
import { StatGrid, StatCard, VerdictBanner } from '../ui/StatCard.jsx';

const SCHWARZSCHILD_DISPLAY_RADIUS = 1.1;
const SOLAR_MASS_KG = 1.989e30;

const horizonVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewPos;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vViewPos = mv.xyz;
    gl_Position = projectionMatrix * mv;
  }
`;
const horizonFragment = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewPos;
  void main() {
    // Fresnel rim: near-black core, faint violet glow only at the silhouette edge —
    // reads as "light bending around the horizon" rather than a flat matte ball.
    float fresnel = pow(1.0 - abs(normalize(vViewPos).z * dot(normalize(vNormal), vec3(0.0,0.0,1.0))), 3.5);
    vec3 rim = vec3(0.45, 0.32, 0.9) * fresnel;
    gl_FragColor = vec4(rim, 1.0);
  }
`;

function EventHorizon({ p }) {
  const geo = useMemo(() => generateSphereGeometry(SCHWARZSCHILD_DISPLAY_RADIUS, p, adaptiveSegments(p, 64), adaptiveSegments(p, 48)), [p]);
  const ref = useRef();
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.y += dt * 0.06; });
  return (
    <mesh geometry={geo} ref={ref}>
      <shaderMaterial vertexShader={horizonVertex} fragmentShader={horizonFragment} />
    </mesh>
  );
}

function PhotonRingGlow({ radius }) {
  // A thin, additive-blended torus standing in for the photon ring's
  // bright, lensed light — glows via bloom instead of a flat line.
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[radius, 0.012, 16, 128]} />
      <meshBasicMaterial color="#ffe3b0" transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} />
    </mesh>
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
  const photonRadius = Number.isFinite(photonCirc) ? Math.max(photonCirc / (2 * REAL_PI), SCHWARZSCHILD_DISPLAY_RADIUS * 1.05) : SCHWARZSCHILD_DISPLAY_RADIUS * 1.5;

  return (
    <section className="grid-2col">
      <div className="glass" style={{ height: '460px', overflow: 'hidden' }}>
        {parsed.kind === 'complex' ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '24px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '360px' }}>
              A complex π gives the event horizon an imaginary radius — general relativity has no
              real-valued solution here. See the Complex Geometry exhibit instead.
            </p>
          </div>
        ) : (
          <ExhibitFrame
            visualLabel={`A glowing orange and white accretion disk swirling around a black event horizon with a violet rim glow, sized according to your pi value. The disk and photon ring stay in ${stable ? 'a coherent proportion' : 'a broken proportion'}.`}
            dataView={<DataTable caption="Black hole measurements at your current π" rows={[
              ['Horizon area vs. real', Number.isFinite(horizonArea) ? `${((horizonArea / realHorizonArea) * 100).toFixed(1)}%` : '—'],
              ['Photon sphere circumference', Number.isFinite(photonCirc) ? photonCirc.toFixed(3) : '—'],
              ['Hawking temp (10 M☉)', Number.isFinite(hawkingTemp) ? `${(hawkingTemp * 1e9).toExponential(2)} nK` : '—'],
              ['Real-π Hawking temp', `${(realHawkingTemp * 1e9).toExponential(2)} nK`],
            ]} />}
          >
            <CanvasErrorBoundary>
              <GlowFrame tint="rgba(255,190,130,0.18)">
                <Canvas camera={{ position: [0, 1.8, 4.6], fov: 42 }} gl={{ antialias: true }}>
                  <color attach="background" args={['#050308']} />
                  <ambientLight intensity={0.06} />
                  <Starfield count={800} radius={30} />
                  <EventHorizon p={p} />
                  {Number.isFinite(photonCirc) && (
                    <>
                      <AccretionDisk innerRadius={SCHWARZSCHILD_DISPLAY_RADIUS * 1.35} outerRadius={photonRadius * 2.6} />
                      <PhotonRingGlow radius={photonRadius} />
                    </>
                  )}
                  <OrbitControls enablePan={false} minDistance={2.5} maxDistance={9} />
                </Canvas>
              </GlowFrame>
            </CanvasErrorBoundary>
          </ExhibitFrame>
        )}
      </div>

      <div className="glass" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <h3 className="display" style={{ margin: 0, fontSize: '19px' }}>🕳️ Black Holes</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', margin: '4px 0 0' }}>
            A = 4p·r² &nbsp;·&nbsp; T = ħc³ / (8p·G·M·k<sub>B</sub>)
          </p>
        </div>
        <StatGrid>
          <StatCard icon="🌑" label="Horizon area" value={Number.isFinite(horizonArea) ? `${((horizonArea / realHorizonArea) * 100).toFixed(0)}%` : '—'} sub="vs. real" />
          <StatCard icon="💫" label="Photon sphere" value={Number.isFinite(photonCirc) ? photonCirc.toFixed(2) : '—'} unit="units" />
          <StatCard icon="🌡️" label="Hawking temp" value={Number.isFinite(hawkingTemp) ? (hawkingTemp * 1e9).toExponential(1) : '—'} unit="nK" />
        </StatGrid>
        <VerdictBanner good={stable} title={stable ? 'Horizon geometry remains coherent' : 'Horizon geometry breaks down'}>
          {stable
            ? 'The event horizon and photon sphere stay in a sensible relative proportion — a self-consistent alternate general relativity could plausibly define black holes this way.'
            : 'The photon sphere either collapses inside the horizon or flies impossibly far outside it — this exact geometric relationship could not describe a real black hole in a universe built on our physics.'}
        </VerdictBanner>
      </div>
    </section>
  );
}
