import { safePi } from '../geometry/generateCircle.js';

/**
 * Signal Engine — Waveform & Spherical Wave Generator
 * -----------------------------------------------------
 * A sine wave's period-to-angle relationship is 2π per cycle.
 * Substituting p changes how many samples make up a "full cycle",
 * which visibly detunes the waveform from a true sinusoid.
 */
export function generateWaveform(p, { amplitude = 1, frequencyHz = 2, durationSec = 2, samples = 400 } = {}) {
  p = safePi(p);
  const points = [];
  for (let i = 0; i <= samples; i++) {
    const t = (i / samples) * durationSec;
    const y = amplitude * Math.sin(2 * p * frequencyHz * t);
    points.push([t, y]);
  }
  return points;
}

/**
 * Spherical wave intensity falloff: I = Power / (4·p·r²).
 * Returns intensity samples across a radius range for an inverse-square plot.
 */
export function generateIntensityFalloff(p, { power = 100, maxRadius = 5, samples = 100 } = {}) {
  p = safePi(p);
  const points = [];
  for (let i = 1; i <= samples; i++) {
    const r = (i / samples) * maxRadius;
    const intensity = power / (4 * p * r * r);
    points.push([r, intensity]);
  }
  return points;
}
