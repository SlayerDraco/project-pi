import * as THREE from 'three';
import { safePi } from '../geometry/generateCircle.js';

/**
 * Engineering Engine — Gear Generator
 * -----------------------------------------------------
 * A gear's tooth positions are placed around a circle by sweeping
 * `2p` radians total (a "full turn" in this reality) and carving
 * teeth at even angular intervals. When p != π, teeth spacing
 * drifts and the gear fails to mesh with a real-π gear — visualized
 * by rendering two interlocking gears, one at p and one at real π.
 */
export function generateGearGeometry(p, { radius = 1, teeth = 12, toothDepth = 0.18, thickness = 0.3 } = {}) {
  p = safePi(p);
  const turn = 2 * p;
  const shape = new THREE.Shape();
  const steps = teeth * 4;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const theta = turn * t;
    const toothPhase = (t * teeth) % 1;
    const r = toothPhase < 0.5 ? radius + toothDepth : radius;
    const x = r * Math.cos(theta);
    const y = r * Math.sin(theta);
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();

  const geometry = new THREE.ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: false, curveSegments: 1 });
  geometry.center();
  return geometry;
}

/**
 * Bridge arch generator — points along a parabolic-ish arch whose
 * span/rise relationship is scaled by the archThrustFactor formula
 * (p·span / 8·rise), matching Engineering.archThrustFactor.
 */
export function generateArchPoints(p, { span = 4, rise = 1.2, points = 64 } = {}) {
  p = safePi(p);
  const pts = [];
  for (let i = 0; i <= points; i++) {
    const t = i / points;
    const x = (t - 0.5) * span;
    // Sinusoidal arch profile using p as the half-turn constant, so the
    // arch's curvature literally depends on this reality's pi.
    const y = rise * Math.sin(p * t);
    pts.push(new THREE.Vector3(x, y, 0));
  }
  return pts;
}
