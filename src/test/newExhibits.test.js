import { describe, it, expect } from 'vitest';
import { generateGalaxy, generateFieldStars } from '../engines/astronomy/generateGalaxy.js';
import { generatePhyllotaxis } from '../engines/nature/generatePhyllotaxis.js';
import { generatePizzaSlices, generateCurveballPath } from '../engines/sports/generateSports.js';
import { Biology } from '../engines/math/formulas.js';

describe('generateGalaxy', () => {
  it('produces arms * starsPerArm stars', () => {
    const stars = generateGalaxy(Math.PI, { arms: 3, starsPerArm: 50 });
    expect(stars.length).toBe(150);
  });

  it('never produces NaN coordinates for extreme p', () => {
    for (const p of [Infinity, -Infinity, 0]) {
      const stars = generateGalaxy(p, { arms: 2, starsPerArm: 20 });
      expect(stars.some((pt) => pt.some(Number.isNaN))).toBe(false);
    }
  });
});

describe('generateFieldStars', () => {
  it('produces the requested count', () => {
    expect(generateFieldStars(100).length).toBe(100);
  });
});

describe('generatePhyllotaxis', () => {
  it('produces the requested seed count', () => {
    const { seeds } = generatePhyllotaxis(Math.PI, { count: 200 });
    expect(seeds.length).toBe(200);
  });

  it('computes the real golden angle correctly at real pi (~137.5°)', () => {
    const { goldenAngle } = generatePhyllotaxis(Math.PI);
    const degrees = (goldenAngle * 180) / Math.PI;
    expect(degrees).toBeCloseTo(137.5, 0);
  });

  it('never produces NaN seed positions for extreme p', () => {
    for (const p of [1e6, -1e6, 0.0001]) {
      const { seeds } = generatePhyllotaxis(p, { count: 50 });
      expect(seeds.some((s) => Number.isNaN(s.x) || Number.isNaN(s.y))).toBe(false);
    }
  });
});

describe('generatePizzaSlices', () => {
  it('divides a full turn into equal wedges at real pi', () => {
    const slices = generatePizzaSlices(Math.PI, 8);
    expect(slices.length).toBe(8);
    expect(slices[7].end).toBeCloseTo(2 * Math.PI);
  });

  it('slices no longer sum to a full turn when p deviates', () => {
    const slices = generatePizzaSlices(5, 8);
    expect(slices[7].end).not.toBeCloseTo(2 * Math.PI, 3);
  });
});

describe('generateCurveballPath', () => {
  it('starts at the origin and ends near the target distance', () => {
    const path = generateCurveballPath(Math.PI, { distance: 18, points: 50 });
    expect(path[0][0]).toBe(0);
    expect(path[path.length - 1][0]).toBeCloseTo(18);
  });
});

describe('Biology formulas used by the Medicine exhibit', () => {
  it('irisAperture scales with p', () => {
    expect(Biology.irisAperture(3, 6)).toBeCloseTo(2 * Biology.irisAperture(3, 3));
  });

  it('alveolusSurfaceArea matches sphere surface area formula', () => {
    expect(Biology.alveolusSurfaceArea(0.1, Math.PI)).toBeCloseTo(4 * Math.PI * 0.01);
  });
});
