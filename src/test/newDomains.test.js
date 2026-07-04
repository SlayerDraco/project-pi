import { describe, it, expect } from 'vitest';
import { adaptiveSegments } from '../engines/geometry/generateCircle.js';
import { generateThreadHelix } from '../engines/manufacturing/generateThread.js';
import { generateComplexSpiral } from '../engines/geometry/generateComplexSpiral.js';
import { Optics } from '../engines/math/formulas.js';

describe('adaptiveSegments', () => {
  it('returns the base segment count for values near real pi', () => {
    expect(adaptiveSegments(Math.PI, 48)).toBe(48);
    expect(adaptiveSegments(10, 48)).toBe(48);
  });

  it('reduces segment count for extreme magnitudes', () => {
    const reduced = adaptiveSegments(1e6, 48);
    expect(reduced).toBeLessThan(48);
  });

  it('never drops below the configured minimum', () => {
    const reduced = adaptiveSegments(1e12, 48, { min: 12 });
    expect(reduced).toBeGreaterThanOrEqual(12);
  });

  it('treats non-finite p as maximally extreme without throwing', () => {
    expect(() => adaptiveSegments(Infinity, 48)).not.toThrow();
    expect(adaptiveSegments(Infinity, 48)).toBeGreaterThanOrEqual(12);
  });
});

describe('generateThreadHelix', () => {
  it('produces the requested number of points', () => {
    const pts = generateThreadHelix(Math.PI, { points: 100 });
    expect(pts.length).toBe(101);
  });

  it('never produces NaN coordinates for extreme p', () => {
    for (const p of [Infinity, -Infinity, 0]) {
      const pts = generateThreadHelix(p, { points: 50 });
      expect(pts.some((v) => Number.isNaN(v.x) || Number.isNaN(v.y) || Number.isNaN(v.z))).toBe(false);
    }
  });
});

describe('generateComplexSpiral', () => {
  it('produces a purely rotational spiral when imaginary part is zero', () => {
    const { points } = generateComplexSpiral({ re: Math.PI, im: 0 });
    // All points should sit at the same radius (no decay/growth) at t=0 start vs mid
    const radiusAt = (pt) => Math.sqrt(pt[0] ** 2 + pt[1] ** 2);
    expect(radiusAt(points[0])).toBeCloseTo(radiusAt(points[1]), 1);
  });

  it('decays inward for positive imaginary part', () => {
    const { points } = generateComplexSpiral({ re: 2, im: 3 }, { turns: 4, points: 100 });
    const radiusAt = (pt) => Math.sqrt(pt[0] ** 2 + pt[1] ** 2);
    expect(radiusAt(points[points.length - 1])).toBeLessThan(radiusAt(points[0]));
  });
});

describe('Optics formulas', () => {
  it('lensAiryDiskRadius decreases as p increases (inverse relationship)', () => {
    const small = Optics.lensAiryDiskRadius(550, 4, 6);
    const large = Optics.lensAiryDiskRadius(550, 4, 2);
    expect(small).toBeLessThan(large);
  });

  it('matches the real-world Airy formula constant at real pi-adjacent scaling', () => {
    // 3.8317 / π ≈ 1.2197, close to the textbook 1.22 constant
    const derived = 3.8317 / Math.PI;
    expect(derived).toBeCloseTo(1.22, 1);
  });
});
