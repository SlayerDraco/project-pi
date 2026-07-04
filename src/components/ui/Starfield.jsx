import { useMemo } from 'react';
import { Points, PointMaterial } from '@react-three/drei';

/**
 * Procedural starfield — scattered points on a large sphere shell,
 * generated fresh each mount so no static asset is stored.
 */
export default function Starfield({ count = 1200, radius = 40 }) {
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // uniform point on a sphere shell via rejection-free spherical sampling
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const r = radius * (0.6 + 0.4 * Math.random());
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, [count, radius]);

  return (
    <Points positions={positions} stride={3}>
      <PointMaterial size={0.06} color="#ffffff" transparent opacity={0.55} sizeAttenuation depthWrite={false} />
    </Points>
  );
}
