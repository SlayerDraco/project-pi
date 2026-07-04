import { describe, it, expect } from 'vitest';
import { Geometry, Astronomy, Engineering, Biology, realityMeters } from '../engines/math/formulas.js';

describe('Geometry formulas', () => {
  it('circleCircumference matches real formula at real pi', () => {
    expect(Geometry.circleCircumference(2, Math.PI)).toBeCloseTo(2 * Math.PI * 2);
  });

  it('circleArea scales linearly with p', () => {
    expect(Geometry.circleArea(3, 6)).toBeCloseTo(6 * 9);
    expect(Geometry.circleArea(3, 3)).toBeCloseTo(Geometry.circleArea(3, 6) / 2);
  });

  it('sphereVolume matches the real formula at real pi', () => {
    const expected = (4 / 3) * Math.PI * 2 ** 3;
    expect(Geometry.sphereVolume(2, Math.PI)).toBeCloseTo(expected);
  });

  it('degreesToRadians/radiansToDegrees are inverse at real pi', () => {
    const rad = Geometry.degreesToRadians(90, Math.PI);
    expect(Geometry.radiansToDegrees(rad, Math.PI)).toBeCloseTo(90);
  });
});

describe('Astronomy formulas', () => {
  it('orbitalPeriod increases with p', () => {
    const shortP = Astronomy.orbitalPeriod(1000, 1e6, 2);
    const longP = Astronomy.orbitalPeriod(1000, 1e6, 6);
    expect(longP).toBeGreaterThan(shortP);
  });

  it('horizonSurfaceArea matches 4·p·r²', () => {
    expect(Astronomy.horizonSurfaceArea(3, 4)).toBeCloseTo(4 * 4 * 9);
  });

  it('hawkingTemperature decreases as p increases (inverse relationship)', () => {
    const t1 = Astronomy.hawkingTemperature(1e31, 2);
    const t2 = Astronomy.hawkingTemperature(1e31, 6);
    expect(t2).toBeLessThan(t1);
  });
});

describe('Engineering formulas', () => {
  it('archThrustFactor scales linearly with p', () => {
    expect(Engineering.archThrustFactor(4, 1, 6)).toBeCloseTo(2 * Engineering.archThrustFactor(4, 1, 3));
  });
});

describe('Biology formulas', () => {
  it('cellSphereVolume matches sphere volume formula', () => {
    expect(Biology.cellSphereVolume(5, Math.PI)).toBeCloseTo(Geometry.sphereVolume(5, Math.PI));
  });
});

describe('realityMeters', () => {
  it('returns ~100 for all meters at the real pi', () => {
    const m = realityMeters(Math.PI);
    expect(m.geometryIntegrity).toBeCloseTo(100, 0);
    expect(m.overallStability).toBeCloseTo(100, 0);
    expect(m.absurdity).toBeCloseTo(0, 0);
  });

  it('degrades stability as p moves away from real pi', () => {
    const near = realityMeters(3.2);
    const far = realityMeters(50);
    expect(far.overallStability).toBeLessThan(near.overallStability);
    expect(far.absurdity).toBeGreaterThan(near.absurdity);
  });

  it('returns 0 stability for non-finite p', () => {
    const m = realityMeters(Infinity);
    expect(m.overallStability).toBe(0);
  });

  it('all meters stay within [0, 100]', () => {
    for (const p of [-50, -1, 0, 0.5, 3.14159, 10, 1000, Infinity, NaN]) {
      const m = realityMeters(p);
      for (const key of ['geometryIntegrity', 'engineeringReliability', 'biologicalViability', 'planetaryStability', 'cosmicConsistency', 'absurdity', 'overallStability']) {
        expect(m[key]).toBeGreaterThanOrEqual(0);
        expect(m[key]).toBeLessThanOrEqual(100);
      }
    }
  });
});
