import { lazy } from 'react';

/**
 * Simulation Registry
 * -----------------------------------------------------
 * Single source of truth for every exhibit. Each entry lazy-loads
 * its component so the initial bundle only pays for the exhibit
 * the user is actively viewing. To add a new exhibit:
 *
 *   1. Build src/components/exhibits/<Name>Exhibit.jsx
 *   2. Add an entry below — nothing else needs to change.
 */
export const EXHIBITS = [
  {
    id: 'geometry',
    label: 'Circles & Spheres',
    category: 'Geometry',
    description: 'The most direct consequence of changing π: circles, spheres, and the shapes built from them.',
    Component: lazy(() => import('../components/exhibits/CircleSphereExhibit.jsx')),
  },
  {
    id: 'earth',
    label: 'Earth & Orbit',
    category: 'Astronomy',
    description: 'Planetary volume and orbital period, both governed by π-dependent formulas.',
    Component: lazy(() => import('../components/exhibits/EarthExhibit.jsx')),
  },
  {
    id: 'dna',
    label: 'DNA & Cells',
    category: 'Biology',
    description: 'The double helix winding angle and cell volume, reimagined under a new π.',
    Component: lazy(() => import('../components/exhibits/DNAExhibit.jsx')),
  },
  {
    id: 'engineering',
    label: 'Gears & Bridges',
    category: 'Engineering',
    description: 'Two interlocking gears — one real, one experimental — and an arch whose thrust factor depends on π.',
    Component: lazy(() => import('../components/exhibits/EngineeringExhibit.jsx')),
  },
  {
    id: 'complex',
    label: 'Complex Geometry',
    category: 'Advanced Mathematics',
    description: 'What π means when it has an imaginary part — a spiral built from complex frequency.',
    Component: lazy(() => import('../components/exhibits/ComplexGeometryExhibit.jsx')),
  },
  {
    id: 'blackhole',
    label: 'Black Holes',
    category: 'Astrophysics',
    description: 'Event horizon area, photon sphere, and Hawking temperature — all functions of π.',
    Component: lazy(() => import('../components/exhibits/BlackHoleExhibit.jsx')),
  },
  {
    id: 'signal',
    label: 'Signal & Acoustics',
    category: 'Signal Processing',
    description: 'Waveforms and spherical wave intensity, rendered live via SVG as π changes.',
    Component: lazy(() => import('../components/exhibits/SignalExhibit.jsx')),
  },
  {
    id: 'optics',
    label: 'Optics',
    category: 'Optics',
    description: 'The Airy diffraction pattern that governs how sharply lenses can focus light.',
    Component: lazy(() => import('../components/exhibits/OpticsExhibit.jsx')),
  },
  {
    id: 'manufacturing',
    label: 'Manufacturing',
    category: 'Manufacturing',
    description: 'Bolt thread helices and pipe flow area — precision machining meets π.',
    Component: lazy(() => import('../components/exhibits/ManufacturingExhibit.jsx')),
  },
  {
    id: 'transportation',
    label: 'Transportation',
    category: 'Transportation',
    description: 'A rolling wheel whose real-physics motion exposes how non-circular it becomes.',
    Component: lazy(() => import('../components/exhibits/TransportationExhibit.jsx')),
  },
  {
    id: 'galaxy',
    label: 'Galaxies',
    category: 'Astronomy',
    description: 'A spiral galaxy of thousands of stars, its arm structure defined by a logarithmic spiral in π.',
    Component: lazy(() => import('../components/exhibits/GalaxyExhibit.jsx')),
  },
  {
    id: 'nature',
    label: 'Nature: Phyllotaxis',
    category: 'Nature',
    description: "A sunflower seed spiral packed by the golden angle — one of nature's most elegant π-dependent patterns.",
    Component: lazy(() => import('../components/exhibits/NatureExhibit.jsx')),
  },
  {
    id: 'sports',
    label: 'Sports',
    category: 'Sports',
    description: 'Pizza slices that may or may not close into a circle, and a curveball trajectory shaped by π.',
    Component: lazy(() => import('../components/exhibits/SportsExhibit.jsx')),
  },
  {
    id: 'medicine',
    label: 'Medicine',
    category: 'Medicine',
    description: "The eye's iris aperture and the lung's alveoli — biology's circles, under a new π.",
    Component: lazy(() => import('../components/exhibits/MedicineExhibit.jsx')),
  },
];

export function getExhibit(id) {
  return EXHIBITS.find((e) => e.id === id) ?? EXHIBITS[0];
}
