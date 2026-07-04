import { describe, it, expect } from 'vitest';
import { safePi, generateCircleGeometry, generateSphereGeometry } from '../engines/geometry/generateCircle.js';

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
