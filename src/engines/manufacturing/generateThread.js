import * as THREE from 'three';
import { safePi } from '../geometry/generateCircle.js';

/**
 * Manufacturing Engine — Bolt Thread Helix
 * -----------------------------------------------------
 * A bolt thread is a helix wound around a cylinder. Its total unwound
 * length is turns · sqrt((2p·r)² + pitch²) — literally the hypotenuse of
 * the helix "unrolled" into a right triangle, per Engineering.boltThreadHelixLength.
 */
export function generateThreadHelix(p, { radius = 0.6, pitch = 0.35, turns = 6, points = 300 } = {}) {
  p = safePi(p);
  const pts = [];
  for (let i = 0; i <= points; i++) {
    const t = (i / points) * turns;
    const angle = 2 * p * t;
    const x = radius * Math.cos(angle);
    const z = radius * Math.sin(angle);
    const y = t * pitch - (turns * pitch) / 2;
    pts.push(new THREE.Vector3(x, y, z));
  }
  return pts;
}
