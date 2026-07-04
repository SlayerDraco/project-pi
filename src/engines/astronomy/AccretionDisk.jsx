import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Rendering Engine — Accretion Disk
 * -----------------------------------------------------
 * A shader-driven disk instead of a flat ring line. Encodes,
 * for visual storytelling (not a GR radiative-transfer solver):
 *  - hot white/blue inner edge cooling to orange/red outward
 *    (real accretion disks do get hotter closer to the hole)
 *  - relativistic-beaming-inspired brightness asymmetry: one side
 *    (approaching the viewer) rendered brighter than the receding side
 *  - turbulent banding via layered sine noise, animated over time
 *  - inner edge driven by the photon-sphere radius, which itself is
 *    a function of the experimental pi (see Astronomy.photonSphereCircumference)
 */
const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  varying vec2 vUv;
  uniform float uTime;
  uniform float uInnerFrac; // fraction of disk radius that is the hot inner edge

  float noise(vec2 p) {
    return sin(p.x * 12.0 + uTime) * sin(p.y * 9.0 - uTime * 0.7) * 0.5 + 0.5;
  }

  void main() {
    // vUv.x is radial (0 = inner edge, 1 = outer edge), vUv.y is angle
    float r = vUv.x;
    float angle = vUv.y * 6.28318530718;

    // Doppler-beaming-inspired brightness: brighter on the "approaching" side.
    float beaming = 0.55 + 0.45 * cos(angle - uTime * 0.6);

    // Radial temperature gradient: hot (white/blue) near the inner edge,
    // cooling to deep orange/red toward the outer edge.
    vec3 hot = vec3(1.0, 0.98, 0.9);
    vec3 mid = vec3(1.0, 0.55, 0.18);
    vec3 cool = vec3(0.55, 0.08, 0.05);
    float t = smoothstep(0.0, 1.0, r);
    vec3 color = mix(hot, mid, smoothstep(0.0, 0.4, t));
    color = mix(color, cool, smoothstep(0.4, 1.0, t));

    // Turbulent banding
    float turbulence = noise(vec2(r * 8.0, angle * 2.0)) * 0.35 + 0.65;

    // Fade to transparent at the very outer rim so the disk doesn't hard-cut.
    float edgeFade = smoothstep(1.0, 0.85, r) * smoothstep(0.0, 0.06, r);

    float intensity = beaming * turbulence * edgeFade;
    gl_FragColor = vec4(color * intensity * 1.6, intensity);
  }
`;

export function AccretionDisk({ innerRadius, outerRadius }) {
  const materialRef = useRef();
  const geometry = useMemo(() => {
    const geo = new THREE.RingGeometry(innerRadius, outerRadius, 128, 32);
    // Remap UVs so u = radial fraction (0..1), v = angle fraction (0..1) —
    // RingGeometry's default UVs aren't radial, so we rebuild them.
    const pos = geo.attributes.position;
    const uv = geo.attributes.uv;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const r = Math.sqrt(x * x + y * y);
      const radial = (r - innerRadius) / (outerRadius - innerRadius);
      const theta = (Math.atan2(y, x) + Math.PI) / (2 * Math.PI);
      uv.setXY(i, radial, theta);
    }
    uv.needsUpdate = true;
    return geo;
  }, [innerRadius, outerRadius]);

  useFrame((_, dt) => {
    if (materialRef.current) materialRef.current.uniforms.uTime.value += dt;
  });

  return (
    <mesh geometry={geometry} rotation={[-Math.PI / 2.4, 0, 0]}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{ uTime: { value: 0 }, uInnerFrac: { value: 0.08 } }}
        transparent
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}
