/**
 * Complex Geometry Engine
 * -----------------------------------------------------
 * When the user's π is complex (p = a + bi), a literal circle/sphere
 * has no meaning — but complex frequencies are a real, well-established
 * concept: in signal processing and control theory, a "complex frequency"
 * s = σ + iω describes a signal that spirals inward or outward while
 * rotating (e^{st} = e^{σt}·(cos ωt + i sin ωt)). We reuse that exact
 * mathematics here, substituting the user's complex π as the frequency:
 *
 *   z(t) = r · e^{i·p·t} = r · e^{-b·t} · (cos(a·t) + i·sin(a·t))
 *
 * This produces a logarithmic spiral: the imaginary part `b` controls
 * growth/decay, the real part `a` controls rotation speed. It is an
 * honest generalization, not a literal circle — the UI must say so.
 *
 * @param {{re:number, im:number}} p
 * @param {object} opts
 * @returns {{points: Array<[number,number,number]>, decayRate:number, angularRate:number}}
 */
export function generateComplexSpiral(p, { radius = 1.4, turns = 4, height = 3, points = 400 } = {}) {
  const a = p.re;
  const b = p.im;
  const pts = [];

  for (let i = 0; i <= points; i++) {
    const t = (i / points) * turns;
    const decay = Math.exp(-b * t * 0.35); // scaled for visual stability across input ranges
    const angle = a * t;
    const x = radius * decay * Math.cos(angle);
    const y = radius * decay * Math.sin(angle);
    const z = (i / points) * height - height / 2;
    pts.push([x, y, z]);
  }

  return { points: pts, decayRate: b, angularRate: a };
}

/**
 * Classifies the qualitative behavior of a complex π for plain-language copy.
 */
export function classifyComplexBehavior(p) {
  const { im: b } = p;
  if (Math.abs(b) < 1e-6) return 'purely rotational — behaves like a real π would';
  if (b > 0) return 'inward-spiraling (decaying) — like a damped oscillator';
  return 'outward-spiraling (growing) — like an unstable feedback system';
}
