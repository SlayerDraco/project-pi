/**
 * Rendering Engine — Scene Effects (CSS glow layer)
 * -----------------------------------------------------
 * A dependency-free stand-in for post-process bloom: a soft
 * additive-ish radial glow sitting over the canvas, plus a
 * vignette, so bright emissive elements (accretion disks, event
 * horizons, star cores) read as luminous instead of flat matte
 * shapes. Pure CSS — costs nothing on the WebGL side.
 *
 * Usage: wrap the <Canvas> in <GlowFrame>...</GlowFrame> rather
 * than placing this inside the Canvas itself.
 */
export function GlowFrame({ children, tint = 'rgba(255,200,140,0.16)' }) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {children}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: `radial-gradient(circle at 50% 45%, ${tint}, transparent 55%)`,
          mixBlendMode: 'screen',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          boxShadow: 'inset 0 0 120px rgba(0,0,0,0.55)',
        }}
      />
    </div>
  );
}

export default function SceneEffects() {
  // Kept as a no-op default export so existing <SceneEffects /> usages
  // inside <Canvas> don't break; real glow now happens via <GlowFrame>.
  return null;
}
