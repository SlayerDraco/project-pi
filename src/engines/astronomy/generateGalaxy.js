import { safePi } from '../geometry/generateCircle.js';

/**
 * Astronomy Engine — Spiral Galaxy Generator
 * -----------------------------------------------------
 * Real spiral galaxies (M51, our Milky Way) are well-approximated by a
 * logarithmic spiral: r = a·e^(b·θ), where θ sweeps across several full
 * turns. We define "one full turn" as 2p radians, so the tightness of
 * the spiral arms — how many times they wind before reaching the galaxy's
 * edge — directly depends on the experimental π.
 *
 * Returns star positions distributed along `arms` spiral arms, plus a
 * scattering of "field stars" for visual density.
 */
export function generateGalaxy(p, { arms = 3, starsPerArm = 220, turns = 2.2, radius = 4, scatter = 0.18 } = {}) {
  p = safePi(p);
  const stars = [];
  const b = 0.28; // logarithmic spiral tightness constant (galaxy-typical value)

  for (let armIndex = 0; armIndex < arms; armIndex++) {
    const armOffset = (armIndex * 2 * p) / arms;
    for (let i = 0; i < starsPerArm; i++) {
      const t = i / starsPerArm;
      const theta = t * turns * 2 * p + armOffset;
      const r = radius * t * Math.exp(b * (theta - armOffset) * 0.15);
      const jitter = (Math.random() - 0.5) * scatter * (0.3 + t);
      const x = r * Math.cos(theta) + jitter;
      const y = r * Math.sin(theta) + jitter;
      const z = (Math.random() - 0.5) * scatter * 0.6;
      stars.push([x, y, z]);
    }
  }
  return stars;
}

/**
 * Same spiral distribution as generateGalaxy, but also returns a matching
 * color per star: a hot white/yellow galactic core cooling to blue-white
 * mid-arm and dusty violet at the rim — so the render isn't a flat
 * single-color point cloud.
 */
export function generateGalaxyWithColor(p, opts = {}) {
  const { arms = 3, starsPerArm = 220, turns = 2.2, radius = 4, scatter = 0.18 } = opts;
  const safeP = safePi(p);
  const b = 0.28;
  const positions = [];
  const colors = [];

  const coreColor = [1.0, 0.93, 0.75];
  const midColor = [0.65, 0.75, 1.0];
  const rimColor = [0.55, 0.4, 0.85];

  for (let armIndex = 0; armIndex < arms; armIndex++) {
    const armOffset = (armIndex * 2 * safeP) / arms;
    for (let i = 0; i < starsPerArm; i++) {
      const t = i / starsPerArm;
      const theta = t * turns * 2 * safeP + armOffset;
      const r = radius * t * Math.exp(b * (theta - armOffset) * 0.15);
      const jitter = (Math.random() - 0.5) * scatter * (0.3 + t);
      const x = r * Math.cos(theta) + jitter;
      const y = r * Math.sin(theta) + jitter;
      const z = (Math.random() - 0.5) * scatter * 0.6;
      positions.push(x, y, z);

      let c;
      if (t < 0.25) c = lerp3(coreColor, midColor, t / 0.25);
      else c = lerp3(midColor, rimColor, (t - 0.25) / 0.75);
      const flicker = 0.85 + Math.random() * 0.3;
      colors.push(c[0] * flicker, c[1] * flicker, c[2] * flicker);
    }
  }
  return { positions: new Float32Array(positions), colors: new Float32Array(colors) };
}

function lerp3(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

/** A sparse halo of background field stars, independent of p (for visual context). */
export function generateFieldStars(count = 300, spread = 7) {
  const stars = [];
  for (let i = 0; i < count; i++) {
    const r = Math.sqrt(Math.random()) * spread;
    const theta = Math.random() * Math.PI * 2;
    const x = r * Math.cos(theta);
    const y = r * Math.sin(theta);
    const z = (Math.random() - 0.5) * 1.5;
    stars.push([x, y, z]);
  }
  return stars;
}
