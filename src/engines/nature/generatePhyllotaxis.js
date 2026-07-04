/**
 * Nature Engine — Phyllotaxis (Sunflower Seed Spiral) Generator
 * -----------------------------------------------------
 * Sunflower seeds, pinecone scales, and pineapple eyes pack according to
 * the golden angle: ψ = 2π(1 − 1/φ) ≈ 137.5°. Each seed is placed at
 * angle i·ψ and radius c·√i — this specific angle is what produces the
 * famous non-overlapping spiral packing efficiency seen throughout nature.
 * Substituting the experimental π changes the golden angle itself, which
 * collapses the elegant packing into visible straight rows or clumps.
 */
const PHI = (1 + Math.sqrt(5)) / 2;

export function generatePhyllotaxis(p, { count = 500, c = 0.16 } = {}) {
  const goldenAngle = 2 * p * (1 - 1 / PHI);
  const seeds = [];
  for (let i = 0; i < count; i++) {
    const angle = i * goldenAngle;
    const radius = c * Math.sqrt(i);
    seeds.push({
      x: radius * Math.cos(angle),
      y: radius * Math.sin(angle),
      index: i,
    });
  }
  return { seeds, goldenAngle };
}
