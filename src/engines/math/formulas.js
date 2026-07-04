/**
 * Mathematics Engine — Formula Library
 * -----------------------------------------------------
 * Every function here takes `p` (the experimental value of π)
 * as an explicit parameter — never Math.PI — so the entire
 * simulation universe is a pure function of one number.
 *
 * Organized by domain. Each formula includes a one-line
 * citation of the real mathematical relationship it encodes.
 */

// ---------- Geometry ----------
export const Geometry = {
  circleCircumference: (r, p) => 2 * p * r,
  circleArea: (r, p) => p * r * r,
  sphereVolume: (r, p) => (4 / 3) * p * r ** 3,
  sphereSurfaceArea: (r, p) => 4 * p * r ** 2,
  cylinderVolume: (r, h, p) => p * r * r * h,
  coneVolume: (r, h, p) => (1 / 3) * p * r * r * h,
  torusVolume: (R, r, p) => 2 * p * p * R * r * r,
  ellipseCircumferenceApprox: (a, b, p) => p * (3 * (a + b) - Math.sqrt((3 * a + b) * (a + 3 * b))),
  degreesToRadians: (deg, p) => (deg * p) / 180,
  radiansToDegrees: (rad, p) => (rad * 180) / p,
};

// ---------- Trigonometry / Waves ----------
export const Waves = {
  // Angular frequency from period, using the real relationship ω = 2π/T,
  // but with the experimental π substituted for the "2π-ish" turn constant.
  angularFrequency: (period, p) => (2 * p) / period,
  waveAtTime: (t, amplitude, period, p) => amplitude * Math.sin(Waves.angularFrequency(period, p) * t),
  pendulumPeriod: (length, g, p) => 2 * p * Math.sqrt(length / g),
};

// ---------- Astronomy / Orbital Mechanics ----------
export const Astronomy = {
  // Kepler-ish circular orbit period: T = 2π√(r³/GM)
  orbitalPeriod: (radius, GM, p) => 2 * p * Math.sqrt(radius ** 3 / GM),
  orbitCircumference: (radius, p) => 2 * p * radius,
  planetVolume: (radius, p) => Geometry.sphereVolume(radius, p),
  // Surface gravity from volume-derived mass at constant density.
  surfaceGravityScale: (radius, p) => Geometry.sphereVolume(radius, p) / radius ** 2,

  // Event horizon surface area for a Schwarzschild radius r_s: A = 4·p·r_s².
  horizonSurfaceArea: (schwarzschildRadius, p) => 4 * p * schwarzschildRadius ** 2,
  // Photon sphere sits at 1.5·r_s; its circumference uses the same 2·p·r relationship.
  photonSphereCircumference: (schwarzschildRadius, p) => 2 * p * 1.5 * schwarzschildRadius,
  // Hawking temperature: T = ħc³ / (8·p·G·M·k_B) — p appears in the denominator,
  // so a larger experimental π means a *cooler* black hole at fixed mass.
  hawkingTemperature: (mass, p, { hbar = 1.0546e-34, c = 2.998e8, G = 6.674e-11, kB = 1.381e-23 } = {}) =>
    (hbar * c ** 3) / (8 * p * G * mass * kB),
};

// ---------- Engineering ----------
export const Engineering = {
  gearCircumference: (r, teeth, p) => 2 * p * r,
  pipeFlowArea: (r, p) => p * r * r,
  // Simplified Euler buckling-style constant reliant on π² term.
  columnBucklingLoad: (E, I, L, p) => (p * p * E * I) / (L * L),
  archThrustFactor: (span, rise, p) => (p * span) / (8 * rise),
  boltThreadHelixLength: (r, pitch, turns, p) => turns * Math.sqrt((2 * p * r) ** 2 + pitch ** 2),
};

// ---------- Signal Processing ----------
export const Signal = {
  // Nyquist / normalized angular frequency uses 2π as the "full turn".
  normalizedFrequency: (f, sampleRate, p) => (2 * p * f) / sampleRate,
  fourierBasis: (n, k, N, p) => ({
    re: Math.cos((2 * p * k * n) / N),
    im: -Math.sin((2 * p * k * n) / N),
  }),
};

// ---------- Statistics / Probability ----------
export const Stats = {
  // Gaussian normal PDF: 1/√(2πσ²) · e^(-(x-μ)²/2σ²)
  normalPDF: (x, mean, std, p) => (1 / (std * Math.sqrt(2 * p))) * Math.exp(-((x - mean) ** 2) / (2 * std * std)),
  stirlingApprox: (n, p) => Math.sqrt(2 * p * n) * (n / Math.E) ** n,
};

// ---------- Biology ----------
export const Biology = {
  // DNA double helix: circumference of the helical turn governs base-pair spacing geometry.
  dnaHelixCircumference: (radius, p) => 2 * p * radius,
  cellSphereVolume: (radius, p) => Geometry.sphereVolume(radius, p),
  // Alveoli / lung surface area modeled as packed spheres — surface scales with p.
  alveolusSurfaceArea: (radius, p) => Geometry.sphereSurfaceArea(radius, p),
  arteryFlowArea: (radius, p) => p * radius * radius,
  irisAperture: (radius, p) => p * radius * radius,
};

// ---------- Optics / Acoustics ----------
export const Optics = {
  // Airy disk radius: r = 1.22 · λ · N. The 1.22 factor is derived from the first
  // zero of the Bessel function J1 (≈3.8317) divided by the real π. We re-derive
  // that scaling with p so the implied diffraction-limited resolution shifts too.
  lensAiryDiskRadius: (wavelength, fNumber, p) => (3.8317 / p) * wavelength * fNumber,
  diffractionAngle: (wavelength, aperture, p) => (2 * p * wavelength) / aperture,
};

export const Acoustics = {
  sphericalWaveIntensity: (power, r, p) => power / (4 * p * r * r),
};

/**
 * Reality Meters — quantify how "survivable" derived physics remains
 * as p deviates from the real π. These are intentionally simple,
 * bounded heuristics (0–100), not physical law — documented as such
 * in the UI copy.
 */
export function realityMeters(p) {
  const REAL = Math.PI;

  // Non-finite or NaN input (e.g. an unparseable expression) has no
  // meaningful deviation — every meter bottoms out at 0 rather than
  // propagating NaN through Math.exp/Math.min.
  if (Number.isNaN(p)) {
    return {
      geometryIntegrity: 0, engineeringReliability: 0, biologicalViability: 0,
      planetaryStability: 0, cosmicConsistency: 0, absurdity: 0,
      overallStability: 0, ratio: NaN,
    };
  }

  const dev = Math.abs(p - REAL);
  const ratio = Number.isFinite(p) ? p / REAL : Infinity;

  const clamp = (v) => Math.max(0, Math.min(100, v));
  const falloff = (k) => clamp(100 * Math.exp(-dev / k));

  return {
    geometryIntegrity: falloff(3),
    engineeringReliability: falloff(1.5),
    biologicalViability: falloff(0.6),
    planetaryStability: falloff(1.0),
    cosmicConsistency: falloff(2.2),
    absurdity: clamp(100 * (1 - Math.exp(-dev / 4))),
    overallStability: Number.isFinite(p) ? clamp(100 * Math.exp(-dev / 1.4)) : 0,
    ratio,
  };
}
