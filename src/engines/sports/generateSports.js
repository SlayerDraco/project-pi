/**
 * Sports Engine — Pizza Slices & Curveball Trajectory
 * -----------------------------------------------------
 * Cutting a pizza into n equal slices divides a full turn (2p radians)
 * into n wedges — the most direct, edible consequence of changing π.
 *
 * The curveball trajectory models the Magnus effect: a spinning ball's
 * lateral deflection oscillates as it travels, with the spin-induced
 * curve's phase governed by the same "radians per turn" constant.
 */
export function generatePizzaSlices(p, slices = 8) {
  const wedgeAngle = (2 * p) / slices;
  return Array.from({ length: slices }, (_, i) => ({
    start: i * wedgeAngle,
    end: (i + 1) * wedgeAngle,
  }));
}

export function generateCurveballPath(p, { distance = 18, spinFactor = 1.4, points = 120 } = {}) {
  const path = [];
  for (let i = 0; i <= points; i++) {
    const t = i / points;
    const x = t * distance;
    // Lateral deflection driven by spin: grows with distance, oscillates
    // at a rate set by p (a real pitch's break is a single smooth curve;
    // here the "smoothness" itself depends on how p defines a turn).
    const lateral = spinFactor * t * Math.sin((p * t) / 2);
    path.push([x, lateral]);
  }
  return path;
}
