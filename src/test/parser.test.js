import { describe, it, expect } from 'vitest';
import { tryFastParse, parseConstant, REAL_PI } from '../engines/math/parser.js';

describe('tryFastParse (synchronous fast path)', () => {
  it('parses plain integers', () => {
    expect(tryFastParse('5').value).toBe(5);
    expect(tryFastParse('-5').value).toBe(-5);
  });

  it('parses decimals', () => {
    expect(tryFastParse('3.14159').value).toBeCloseTo(3.14159);
  });

  it('parses simple fractions', () => {
    expect(tryFastParse('22/7').value).toBeCloseTo(22 / 7);
  });

  it('parses Infinity variants', () => {
    expect(tryFastParse('Infinity').kind).toBe('infinite');
    expect(tryFastParse('Infinity').value).toBe(Infinity);
    expect(tryFastParse('-Infinity').value).toBe(-Infinity);
    expect(tryFastParse('inf').kind).toBe('infinite');
  });

  it('returns null for symbolic expressions (needs full parser)', () => {
    expect(tryFastParse('sqrt(2)')).toBeNull();
    expect(tryFastParse('pi')).toBeNull();
    expect(tryFastParse('2+3i')).toBeNull();
  });

  it('handles empty input', () => {
    expect(tryFastParse('').kind).toBe('invalid');
    expect(tryFastParse('   ').kind).toBe('invalid');
  });

  it('computes deviation relative to real pi', () => {
    expect(tryFastParse(String(REAL_PI)).deviation).toBeCloseTo(1);
    expect(tryFastParse('0').deviation).toBe(0);
  });
});

describe('parseConstant (full symbolic parser)', () => {
  it('resolves named constants', async () => {
    expect((await parseConstant('pi')).value).toBeCloseTo(Math.PI);
    expect((await parseConstant('e')).value).toBeCloseTo(Math.E);
    expect((await parseConstant('tau')).value).toBeCloseTo(2 * Math.PI);
    expect((await parseConstant('phi')).value).toBeCloseTo(1.6180339887);
  });

  it('evaluates functions', async () => {
    expect((await parseConstant('sqrt(2)')).value).toBeCloseTo(Math.SQRT2);
  });

  it('resolves complex numbers', async () => {
    const result = await parseConstant('2+3i');
    expect(result.kind).toBe('complex');
    expect(result.complex.re).toBeCloseTo(2);
    expect(result.complex.im).toBeCloseTo(3);
  });

  it('treats a complex number with negligible imaginary part as real', async () => {
    const result = await parseConstant('5+0i');
    expect(result.kind).toBe('real');
  });

  it('returns invalid for garbage input', async () => {
    const result = await parseConstant('???not math???');
    expect(result.kind).toBe('invalid');
  });

  it('still handles the fast path when called directly', async () => {
    expect((await parseConstant('7')).value).toBe(7);
  });
});
