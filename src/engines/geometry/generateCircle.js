import * as THREE from 'three';

/**
 * Adaptive-precision guard. Extreme or non-finite p values (Infinity, NaN, or
 * magnitudes so large that further precision is visually meaningless) are
 * clamped to a large-but-finite proxy so geometry generation never produces
 * NaN vertices. This preserves "mathematical correctness" in the underlying
 * formulas (which still receive the true p) while keeping renders stable —
 * per the adaptive precision goal in the project spec.
 */
const RENDER_PI_CAP = 1e4;
export function safePi(p) {
  if (!Number.isFinite(p)) return p > 0 ? RENDER_PI_CAP : p < 0 ? -RENDER_PI_CAP : 0.0001;
  if (Math.abs(p) > RENDER_PI_CAP) return Math.sign(p) * RENDER_PI_CAP;
  if (Math.abs(p) < 1e-6) return Math.sign(p || 1) * 1e-6; // avoid degenerate zero-turn geometry
  return p;
}

/**
 * Adaptive precision (LOD): as |p| grows far beyond the real π, additional
 * segments stop being visually distinguishable (the shape either degenerates
 * into an extremely tight coil or an extremely sparse one), so we scale
 * segment count down at extremes to keep vertex counts — and frame time —
 * bounded, while never dropping below a legible minimum.
 */
export function adaptiveSegments(p, baseSegments, { min = 12, extremeAt = 200 } = {}) {
  const magnitude = Number.isFinite(p) ? Math.abs(p) : RENDER_PI_CAP;
  if (magnitude <= extremeAt) return baseSegments;
  const falloff = Math.max(0, 1 - Math.log10(magnitude / extremeAt) * 0.35);
  return Math.max(min, Math.round(baseSegments * falloff));
}

/**
 * Geometry Engine — Circle/Disc Generator
 * -----------------------------------------------------
 * Builds a disc's vertex ring by literally walking `segments`
 * steps around a full turn of size `2p`, where `p` is the
 * experimental pi. This means the shape ITSELF is wrong when
 * p != real π — segments overshoot or undershoot a real circle,
 * which is the whole point: geometry is deriving from p, not
 * from THREE's built-in (real) circle geometry.
 *
 * @param {number} radius
 * @param {number} p - experimental pi
 * @param {number} segments
 * @returns {THREE.BufferGeometry}
 */
export function generateCircleGeometry(radius, p, segments = 128) {
  p = safePi(p);
  const positions = [0, 0, 0]; // center vertex
  const indices = [];
  const turn = 2 * p; // a "full turn" as defined by this reality's pi

  for (let i = 0; i <= segments; i++) {
    const theta = (turn * i) / segments;
    const x = radius * Math.cos(theta);
    const y = radius * Math.sin(theta);
    positions.push(x, y, 0);
    if (i > 0) {
      indices.push(0, i, i + 1);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * Builds a ring outline as an array of THREE.Vector3 points, so users can
 * visually see the "gap" or "overlap" when p != π — the ring won't close
 * perfectly. Returns a plain point array (not a BufferGeometry) because
 * every current consumer feeds this directly into drei's <Line points={...}>,
 * which expects an array of points/Vector3s — not a raw Float32Array (which
 * has no .flat() method and crashes drei's internal normalization).
 */
export function generateRingOutline(radius, p, segments = 128) {
  p = safePi(p);
  const points = [];
  const turn = 2 * p;
  for (let i = 0; i <= segments; i++) {
    const theta = (turn * i) / segments;
    points.push(new THREE.Vector3(radius * Math.cos(theta), radius * Math.sin(theta), 0));
  }
  return points;
}

/**
 * Sphere generator — parameterizes both polar and azimuthal sweeps
 * by the experimental pi, matching the real UV-sphere construction
 * (u in [0, 2π], v in [0, π]) but substituting p.
 */
export function generateSphereGeometry(radius, p, widthSegments = 48, heightSegments = 32) {
  p = safePi(p);
  const positions = [];
  const normals = [];
  const indices = [];

  for (let iy = 0; iy <= heightSegments; iy++) {
    const v = iy / heightSegments;
    const theta = v * p; // polar sweep 0..p  (real geometry: 0..π)
    for (let ix = 0; ix <= widthSegments; ix++) {
      const u = ix / widthSegments;
      const phi = u * 2 * p; // azimuthal sweep 0..2p (real geometry: 0..2π)

      const x = -radius * Math.cos(phi) * Math.sin(theta);
      const y = radius * Math.cos(theta);
      const z = radius * Math.sin(phi) * Math.sin(theta);

      positions.push(x, y, z);
      const len = Math.sqrt(x * x + y * y + z * z) || 1;
      normals.push(x / len, y / len, z / len);
    }
  }

  const grid = widthSegments + 1;
  for (let iy = 0; iy < heightSegments; iy++) {
    for (let ix = 0; ix < widthSegments; ix++) {
      const a = iy * grid + ix;
      const b = a + grid;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setIndex(indices);
  return geometry;
}
