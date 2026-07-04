import { describe, it, expect } from 'vitest';
import { safePi, generateCircleGeometry, generateSphereGeometry, generateRingOutline } from '../engines/geometry/generateCircle.js';

describe('safePi', () => {
  it('passes through normal finite values unchanged', () => {
    expect(safePi(3.14159)).toBeCloseTo(3.14159);
    expect(safePi(-2)).toBe(-2);
  });

  it('clamps +Infinity to a large finite proxy', () => {
    const result = safePi(Infinity);
    expect(Number.isFinite(result)).toBe(true);
    expect(result).toBeGreaterThan(0);
  });

  it('clamps -Infinity to a large negative finite proxy', () => {
    const result = safePi(-Infinity);
    expect(Number.isFinite(result)).toBe(true);
    expect(result).toBeLessThan(0);
  });

  it('handles NaN without producing NaN', () => {
    expect(Number.isFinite(safePi(NaN)) || safePi(NaN) === 0).toBe(true);
    expect(Number.isNaN(safePi(NaN))).toBe(false);
  });

  it('avoids exact zero to prevent degenerate geometry', () => {
    expect(safePi(0)).not.toBe(0);
  });
});

describe('generateCircleGeometry', () => {
  it('produces a valid, non-empty buffer geometry for typical p', () => {
    const geo = generateCircleGeometry(1, Math.PI, 32);
    expect(geo.attributes.position.count).toBeGreaterThan(0);
  });

  it('does not throw or produce NaN vertices for Infinity', () => {
    const geo = generateCircleGeometry(1, Infinity, 32);
    const arr = geo.attributes.position.array;
    expect(Array.from(arr).some(Number.isNaN)).toBe(false);
  });

  it('does not throw or produce NaN vertices for p = 0', () => {
    const geo = generateCircleGeometry(1, 0, 32);
    const arr = geo.attributes.position.array;
    expect(Array.from(arr).some(Number.isNaN)).toBe(false);
  });
});

describe('generateSphereGeometry', () => {
  it('produces matching position/normal/index counts', () => {
    const geo = generateSphereGeometry(1, Math.PI, 16, 12);
    expect(geo.attributes.position.count).toBe(geo.attributes.normal.count);
  });

  it('never produces NaN for extreme p', () => {
    for (const p of [Infinity, -Infinity, 0, 1e12]) {
      const geo = generateSphereGeometry(1, p, 12, 8);
      const arr = geo.attributes.position.array;
      expect(Array.from(arr).some(Number.isNaN)).toBe(false);
    }
  });
});

describe('generateRingOutline', () => {
  // Regression test: this function previously returned a THREE.BufferGeometry,
  // and every exhibit consumed it via `.attributes.position.array` — a raw
  // Float32Array. drei's <Line points={...}> expects an array of points
  // (plain arrays or Vector3s) and calls `.flat()` on it internally, which
  // Float32Array doesn't support, crashing every exhibit that rendered a
  // ring outline (Circles & Spheres, Earth & Orbit, Black Holes,
  // Transportation) with "pValues.flat is not a function". This test locks
  // in the fixed return shape so that regression can't silently reappear.
  it('returns a plain array, not a BufferGeometry', () => {
    const result = generateRingOutline(1, Math.PI, 16);
    expect(Array.isArray(result)).toBe(true);
    expect(result.attributes).toBeUndefined();
  });

  it('returned points support .flat() (what drei Line requires)', () => {
    const result = generateRingOutline(1, Math.PI, 16);
    expect(() => result.flat()).not.toThrow();
  });

  it('each point has finite x/y/z, including at extreme p', () => {
    for (const p of [Math.PI, Infinity, -Infinity, 0]) {
      const result = generateRingOutline(1, p, 16);
      for (const pt of result) {
        expect(Number.isFinite(pt.x)).toBe(true);
        expect(Number.isFinite(pt.y)).toBe(true);
        expect(Number.isFinite(pt.z)).toBe(true);
      }
    }
  });

  it('produces segments + 1 points', () => {
    const result = generateRingOutline(1, Math.PI, 32);
    expect(result.length).toBe(33);
  });
});
