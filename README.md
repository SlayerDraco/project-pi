# Project π — Reality Constant

> What would reality look like if π were different? Not just circles. Everything.

## Status

**v0.7 (final pass in this series).** Two "museum guide" features: a **Guided Tour** that
auto-cycles through nine curated π values with cinematic pacing (real π → 2 → 22/7 → φ → 10 →
2+3i → 100 → ∞ → back to real π), and an **Ambient Tone** toggle that sonifies the current
reality's stability meter through a Web Audio oscillator — calmer and lower when π is close to
real, tenser and higher as it destabilizes. Both are entirely opt-in.

This pass also did a real bug sweep: `npm run lint` was referenced in `package.json` but had
**no ESLint config at all** — running it failed outright. Added a working flat config, fixed a
peer-dependency conflict (`eslint-plugin-react-hooks` didn't support ESLint 9), and then
actually ran it: 78 errors and 12 warnings surfaced. Most were false positives from
react-three-fiber's custom JSX properties (`intensity`, `args`, `position` aren't real DOM
attributes, which a generic React linter doesn't know) and have been explicitly suppressed
with a comment explaining why. The genuine issues — unused imports/variables in 5 exhibit
files, a stale eslint-disable comment, and a `useMemo` dependency that referenced a
freshly-created object on every render (silently defeating its own memoization) — were
actually fixed, not suppressed. `npm run lint` now passes clean.

14 exhibits, 57 tests, 0 lint errors. Two more exhibits (DNA & Cells, Black Holes) were also
retrofitted with the `ExhibitFrame` accessibility pattern this pass, bringing the total to 7
of 14 exhibits with the Visual/Data-view toggle.

## Vision

Every visual is generated from one number, `p`, the experimental value users assign to π.
Nothing is a static asset or a pre-baked animation — geometry, orbital periods, DNA helix
pitch, and reality-meter values are all pure functions of `p`, computed live.

## Quick Start

```bash
npm install
npm run dev       # http://localhost:5173
npm run build      # production build to /dist
npm run preview    # preview the production build
npm test           # run the Vitest suite (57 tests)
npm run lint        # ESLint (0 errors as of this pass)
```

## Architecture

```
src/
  engines/
    math/
      parser.js       # arbitrary string -> real | complex | infinite value
      formulas.js      # p-dependent formulas: geometry, waves, astronomy,
                        # engineering, signal, stats, biology, optics, acoustics,
                        # plus realityMeters(p)
    geometry/
      generateCircle.js # procedural BufferGeometry builders (circle, ring, sphere)
                          # + safePi() adaptive-precision guard against Infinity/NaN
      generateComplexSpiral.js # complex-π spiral generator (complex frequency analogy)
    biology/
      generateDNA.js     # double-helix strand + rung point generator
    engineering/
      generateGear.js    # gear tooth profile + bridge arch point generator
    signal/
      generateWaveform.js # waveform + spherical intensity falloff sampling
    manufacturing/
      generateThread.js   # bolt thread helix point generator
  hooks/
    useKeyboardOrbit.js  # arrow-key rotation for 3D groups (keyboard accessibility)
  data/
    exhibitRegistry.js  # single source of truth for all exhibits; lazy-loaded
  state/
    useRealityStore.js  # zustand store: parsed constant, achievements, meters,
                          # exhibit-visit tracking, URL-based sharing
  components/
    layout/OpeningScreen.jsx   # cinematic intro
    screens/AchievementGallery.jsx # full achievement list, locked/unlocked/hidden
    ui/InputConsole.jsx        # parser-backed input + presets, async/debounced preview
    ui/RealityMeters.jsx       # animated meter bars
    ui/AchievementToast.jsx    # unlock notifications
    ui/CanvasErrorBoundary.jsx # WebGL/render failure containment
    ui/ShareButton.jsx         # copies a ?pi=... link to the clipboard
    ui/ExhibitFrame.jsx        # Visual/Data-view toggle; auto-data-view on reduced-motion
    ui/DataTable.jsx           # accessible table for the data-view fallback
    ui/TourMode.jsx            # guided tour: auto-cycles curated pi values
    ui/AmbientToneToggle.jsx   # Web Audio sonification of reality stability
    exhibits/CircleSphereExhibit.jsx
    exhibits/EarthExhibit.jsx
    exhibits/DNAExhibit.jsx
    exhibits/EngineeringExhibit.jsx
    exhibits/ComplexGeometryExhibit.jsx
    exhibits/BlackHoleExhibit.jsx
    exhibits/SignalExhibit.jsx
    exhibits/OpticsExhibit.jsx
    exhibits/ManufacturingExhibit.jsx
    exhibits/TransportationExhibit.jsx
  test/
    parser.test.js         # fast-path + symbolic parser coverage
    formulas.test.js        # formula correctness + realityMeters bounds
    generateCircle.test.js  # safePi guard + geometry NaN-safety
    newDomains.test.js      # adaptiveSegments LOD, thread helix, complex spiral, optics
  App.jsx
  main.jsx
  styles/global.css   # includes .grid-2col mobile-first responsive rules
```

### Why engines are separated

Each engine is a pure-function module with no React/Three.js dependency where possible
(`math/formulas.js`, `math/parser.js`), so the same logic can back a future server-rendered
share-card generator, unit tests, or a non-React frontend without modification.

### How procedural generation works here

`generateSphereGeometry(radius, p, ...)` builds a UV sphere by sweeping `theta` from `0..p`
and `phi` from `0..2p` — the real construction uses `0..π` and `0..2π`. Substituting the
experimental constant means the *mesh itself* is mathematically distorted when `p != π`,
rather than a real sphere with a "wrong" label. This is the core technique to extend to every
future generator: never call `Math.PI` inside a generator, always accept `p` as a parameter.

### Adding a new exhibit

1. Add domain formulas to `src/engines/math/formulas.js` (pure functions of `p`).
2. If it needs custom geometry, add a generator in a `src/engines/<domain>/` folder that
   accepts `p`, runs it through `safePi()`, and returns geometry/points.
3. Create `src/components/exhibits/<Name>Exhibit.jsx` following `EngineeringExhibit.jsx` as a
   template: `CanvasErrorBoundary` + Canvas + generated mesh + a stats panel + a
   survivability/plausibility note, with a complex-π fallback message.
4. Add one entry to `EXHIBITS` in `src/data/exhibitRegistry.js` — nothing else needs touching.
   The component is lazy-loaded automatically and gets its own bundle chunk.

## Tech Stack

- **Vite** — build tool, fast HMR, easy code-splitting via `manualChunks`.
- **React 18** — UI layer.
- **@react-three/fiber + drei + three.js** — WebGL rendering, declarative scene graph.
- **framer-motion** — cinematic transitions, meter animations, toasts.
- **mathjs** — expression parsing (fractions, constants, complex numbers, functions).
- **zustand** — minimal global state for the current reality constant and achievements.

## Mathematical & Scientific Approach

Formulas are grouped by domain in `formulas.js`, each with a one-line note on the real
relationship it encodes (e.g. `T = 2π√(a³/GM)` for orbital period). The `realityMeters(p)`
function is an intentionally simple, documented **heuristic**, not physical law — it uses
exponential falloff from the real π to produce bounded 0–100 stability scores. Exhibits are
expected to explicitly separate "our universe would collapse" statements (e.g. Earth's exhibit
survivability note) from imaginative "a self-consistent alternate universe might instead..."
framing, per the project's scientific philosophy.

## Accessibility (current state)

- Reduced-motion is respected globally via a `prefers-reduced-motion` CSS block, and
  `ExhibitFrame` now auto-selects the text Data View when that setting is on.
- 11 of 14 exhibits ship with `ExhibitFrame` (a visible Visual/Data-view toggle plus an
  `aria-label` describing the 3D/SVG scene for screen readers): Circles & Spheres, Earth &
  Orbit, DNA & Cells, Black Holes, Optics, Manufacturing, Transportation, Galaxies, Nature,
  Sports, Medicine. Gears & Bridges, Complex Geometry, and Signal & Acoustics still only show
  inline stat rows.
- The Manufacturing exhibit demonstrates `useKeyboardOrbit`: arrow keys rotate the 3D group
  without needing a mouse — the pattern other WebGL exhibits can adopt.
- Inputs are labeled; live regions announce parse results.
- Mobile-first layout: `.grid-2col` collapses to a single column below 760px, touch targets
  are enforced at 40px minimum, and the pi-input font-size is locked to 16px to prevent iOS
  auto-zoom on focus.
- **Not yet done:** retrofitting `ExhibitFrame` onto Gears & Bridges, Complex Geometry, and
  Signal & Acoustics (mechanical remaining work); `useKeyboardOrbit` is only wired into one
  exhibit; Tour Mode and Ambient Tone have no keyboard-only or screen-reader-specific testing
  yet beyond standard button semantics (`aria-pressed`, `aria-label`, `role="status"`).

## License

Recommend **MIT** for the codebase. If shipped as a museum installation, consider
dual-licensing exhibit content (CC BY-NC) separately from code.

---

# Engineering & Design Review

## Bugs & Known Issues

- ~~Optics, Manufacturing, Transportation exhibits missing~~ — fixed; all three now exist and
  use the formula library that was previously unused (`Optics.*`, `Engineering.pipeFlowArea`,
  `Engineering.boltThreadHelixLength`).
- ~~No text/data-view fallback per exhibit~~ — fixed for 7 of 14 exhibits via `ExhibitFrame` +
  `DataTable` (Circles & Spheres, Earth & Orbit, DNA & Cells, Black Holes, Optics,
  Manufacturing, Transportation). The remaining 7 (Gears & Bridges, Complex Geometry, Signal &
  Acoustics, Galaxies, Nature, Sports, Medicine) still only show inline stat rows in the side
  panel, not a toggleable full data view — though Galaxies, Nature, Sports, and Medicine were
  all built with `ExhibitFrame` from the start, so really it's just Gears & Bridges, Complex
  Geometry, and Signal & Acoustics still needing retrofit.
- ~~No keyboard navigation for 3D exhibits~~ — fixed for Manufacturing via
  `useKeyboardOrbit`; the other WebGL exhibits still depend on `OrbitControls`' mouse/touch
  default and haven't adopted the hook yet.
- ~~Adaptive LOD was numeric-safety only, not actual segment reduction~~ — fixed;
  `adaptiveSegments()` now measurably reduces vertex counts as `|p|` grows past 200, verified
  by tests. Applied to Circle/Sphere, Earth, and Black Hole exhibits; DNA and Manufacturing use
  fixed point counts still (their point-based line generators are cheap enough that this
  matters less, but it's an inconsistency worth resolving).
- Galaxies, Sports, Medicine, and general "Nature" exhibits from the original brief's example
  list are still not built — see the Status section's honest scope note above.
- The Transportation exhibit's "rolling wheel" is a simplified 2D-profile-on-a-track
  demonstration, not a physically simulated rigid body — the "bump/skid" is implied by the
  shape mismatch, not computed from contact-point physics.
- Component-level tests (React Testing Library) still don't exist — only the pure-function
  engine layer has test coverage (57 tests). Tour Mode and Ambient Tone (both new this pass)
  have no tests at all yet — they're UI-effect-heavy (timers, Web Audio) rather than pure
  functions, so they'd need component tests with fake timers/mocked AudioContext, not more
  unit tests of the existing kind.
- Achievement persistence uses `localStorage` only — no account system, no cross-device sync.
  Shareable `?pi=` links carry the constant, not achievement state or which exhibit was open.
- No onboarding/tutorial walkthrough.
- The Engineering exhibit's "gears mesh" check and the Black Hole exhibit's held-constant
  physical constants remain documented simplifications, not rigorous physics.

## Recommendations

- Finish retrofitting `ExhibitFrame` + `useKeyboardOrbit` onto the remaining 5 exhibits so the
  accessibility pattern is uniform across all 10, not 5.
- Add component/rendering tests (React Testing Library) for `ExhibitFrame`'s reduced-motion
  auto-switch, `InputConsole`, and `AchievementGallery`.
- Build the still-missing example categories: a Galaxies/large-scale-structure exhibit, a
  Sports exhibit (e.g. a spinning ball's Magnus effect or a stadium dome's structural geometry),
  and a Medicine exhibit (e.g. the Biology engine's `alveolusSurfaceArea`/`arteryFlowArea`
  formulas already exist but have no dedicated exhibit yet).
- Extend `adaptiveSegments` to the manufacturing/DNA point-based generators for consistency.
- Encode the active exhibit tab (and possibly achievement state) into the `?pi=` share link.

## Priority Roadmap

**Critical**
- ~~Fix `Optics.lensAiryDiskRadius` placeholder~~ — done.
- ~~Guard all geometry generators against `Infinity`/`NaN`~~ — done.
- ~~Add an error boundary around every Canvas~~ — done.

**High Priority**
- ~~Data-driven exhibit registry + code-splitting per exhibit~~ — done.
- ~~Real Complex Geometry mode~~ — done.
- ~~Optics, Manufacturing, Transportation exhibits~~ — done.
- Finish the accessibility retrofit (`ExhibitFrame`/`useKeyboardOrbit`) on the 5 remaining
  exhibits that don't have it yet.
- Galaxies, Sports, Medicine exhibits (formulas partly exist, no dedicated exhibit).

**Medium Priority**
- ~~Adaptive LOD~~ — done for the sphere-heavy exhibits; extend to remaining point-based ones.
- ~~Achievement gallery + more achievements + share links~~ — done.
- ~~Unit test suite~~ — done (57 tests); component/rendering tests still open.
- ~~Working lint setup~~ — done; `npm run lint` had no config at all before this pass and now
  runs clean.

**Nice to Have**
- Shader-based effects (chromatic aberration on "reality breaking down", refraction).
- Sound design tied to `p` (the Signal exhibit's waveform doubling as ambient audio).
- Guided "tour mode" that walks through a curated sequence of extreme π values.

## Overall Evaluation

| Category | Score |
|---|---|
| Architecture | 8/10 |
| Code Quality | 7/10 |
| Maintainability | 8/10 |
| Scalability | 8/10 |
| Scientific Accuracy | 7/10 |
| Mathematical Accuracy | 8/10 |
| Performance | 7/10 |
| Accessibility | 6/10 (pattern proven, half-rolled-out) |
| User Experience | 7/10 |
| Visual Design | 6/10 |
| Animation Quality | 6/10 |
| Educational Value | 7/10 (14 exhibits across 14 distinct domains) |
| Creativity | 7/10 |
| Overall Polish | 7/10 |

**To become a world-class exhibit**, this still needs: the remaining accessibility retrofit
finished uniformly, a handful more exhibits (galaxies, sports, medicine) to round out the
brief's named categories, component-level tests alongside the existing engine tests, and a
visual design pass for polish at scale (shader effects, more refined typography rhythm,
richer transitions). None of this requires restructuring what exists — every prior session's
architectural bets (the registry, `safePi`/`adaptiveSegments`, the `ExhibitFrame` pattern, the
formula library) held up under this round of additions without a single refactor.
