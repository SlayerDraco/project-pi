import * as THREE from 'three';
import { safePi } from '../geometry/generateCircle.js';

/**
 * Biology Engine — DNA Helix Generator
 * -----------------------------------------------------
 * A double helix is two circular sweeps offset by half a turn,
 * translated along an axis. The "turn" a base pair completes
 * per rise step is defined here as 2p/basesPerTurn — in reality,
 * ~10.5 base pairs complete a real 2π turn. Substituting p changes
 * how "twisted" the helix becomes per unit rise.
 *
 * Returns two THREE.BufferGeometry line-strand point sets and an
 * array of rung (base-pair) segments connecting them.
 */
export function generateDNAHelix(p, { radius = 0.5, rise = 6, basesPerTurn = 10.5, points = 200 } = {}) {
  p = safePi(p);
  const strandA = [];
  const strandB = [];
  const rungs = [];
  const turnPerBase = (2 * p) / basesPerTurn;

  for (let i = 0; i <= points; i++) {
    const t = i / points;
    const y = t * rise - rise / 2;
    const theta = t * points * turnPerBase * 0.15; // overall winding scaled for visual density

    const ax = radius * Math.cos(theta);
    const az = radius * Math.sin(theta);
    const bx = radius * Math.cos(theta + p); // opposite strand offset by half turn (p radians)
    const bz = radius * Math.sin(theta + p);

    strandA.push(new THREE.Vector3(ax, y, az));
    strandB.push(new THREE.Vector3(bx, y, bz));

    if (i % 8 === 0) {
      rungs.push([new THREE.Vector3(ax, y, az), new THREE.Vector3(bx, y, bz)]);
    }
  }

  return { strandA, strandB, rungs, turnPerBase };
}
