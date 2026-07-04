import { useRealityStore } from '../../state/useRealityStore.js';
import { Biology } from '../../engines/math/formulas.js';
import { REAL_PI } from '../../engines/math/parser.js';
import ExhibitFrame from '../ui/ExhibitFrame.jsx';
import DataTable from '../ui/DataTable.jsx';

const SIZE = 260;
const CENTER = SIZE / 2;
const MAX_R = 90;
const BLADES = 10;

function IrisBlades({ opennessRatio }) {
  const r = MAX_R * Math.max(0.08, Math.min(1, opennessRatio));
  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width="100%" height="100%">
      <defs>
        <radialGradient id="irisGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0a0a0d" />
          <stop offset="70%" stopColor="#3a5a8c" />
          <stop offset="100%" stopColor="#1a1a22" />
        </radialGradient>
      </defs>
      <rect width={SIZE} height={SIZE} fill="#08080c" />
      <circle cx={CENTER} cy={CENTER} r={MAX_R} fill="url(#irisGrad)" />
      <circle cx={CENTER} cy={CENTER} r={r} fill="#000" />
      {Array.from({ length: BLADES }).map((_, i) => {
        const angle = (i / BLADES) * Math.PI * 2;
        const x = CENTER + Math.cos(angle) * (r + (MAX_R - r) / 2);
        const y = CENTER + Math.sin(angle) * (r + (MAX_R - r) / 2);
        return <circle key={i} cx={x} cy={y} r={3} fill="#0a0a0d" opacity={0.6} />;
      })}
    </svg>
  );
}

export default function MedicineExhibit() {
  const parsed = useRealityStore((s) => s.parsed);
  const p = parsed.kind === 'real' ? parsed.value : parsed.kind === 'infinite' ? parsed.value : REAL_PI;

  const pupilRadius = 3; // mm, mid-dilation reference
  const aperture = Biology.irisAperture(pupilRadius, p);
  const realAperture = Biology.irisAperture(pupilRadius, REAL_PI);
  const alveolusArea = Biology.alveolusSurfaceArea(0.1, p); // mm, alveolus radius
  const realAlveolusArea = Biology.alveolusSurfaceArea(0.1, REAL_PI);

  const opennessRatio = Number.isFinite(aperture) && Number.isFinite(realAperture) && realAperture !== 0
    ? Math.sqrt(Math.min(3, Math.max(0.05, aperture / realAperture)))
    : 0.5;

  const functional = Number.isFinite(p) && p > 2 && p < 5;

  const dataRows = [
    ['Iris aperture area', Number.isFinite(aperture) ? `${aperture.toFixed(2)} mm²` : '—'],
    ['Real-π aperture area', `${realAperture.toFixed(2)} mm²`],
    ['Alveolus surface area', Number.isFinite(alveolusArea) ? `${alveolusArea.toFixed(4)} mm²` : '—'],
    ['Real-π alveolus surface area', `${realAlveolusArea.toFixed(4)} mm²`],
    ['Light/gas exchange function', functional ? 'Plausible' : 'Impaired'],
  ];

  return (
    <section className="grid-2col">
      <div className="glass" style={{ height: '420px', overflow: 'hidden' }}>
        {parsed.kind === 'complex' ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '24px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '360px' }}>
              A complex π gives the pupil an imaginary opening size — there's no literal eye to
              simulate here.
            </p>
          </div>
        ) : (
          <ExhibitFrame
            visualLabel={`A stylized eye iris with a circular pupil opening at its center. The pupil is currently ${opennessRatio > 1 ? 'wider than' : 'narrower than'} it would be under the real pi, by a factor of about ${opennessRatio.toFixed(2)}.`}
            dataView={<DataTable caption="Medicine measurements at your current π" rows={dataRows} />}
          >
            <IrisBlades opennessRatio={opennessRatio} />
          </ExhibitFrame>
        )}
      </div>

      <div className="glass" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <h3 className="display" style={{ margin: 0, fontSize: '18px' }}>Medicine: Eyes &amp; Lungs</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
          Iris aperture = p·r² &nbsp;·&nbsp; Alveolus surface area = 4p·r²
        </p>
        <Row label="Iris aperture area" value={Number.isFinite(aperture) ? `${aperture.toFixed(2)} mm²` : '—'} />
        <Row label="Real-π aperture area" value={`${realAperture.toFixed(2)} mm²`} />
        <Row label="Alveolus surface area" value={Number.isFinite(alveolusArea) ? `${alveolusArea.toFixed(4)} mm²` : '—'} />
        <div style={{
          marginTop: '6px', padding: '12px 14px', borderRadius: 'var(--radius-sm)',
          background: functional ? 'rgba(107,255,176,0.08)' : 'rgba(255,107,107,0.08)',
          border: `1px solid ${functional ? 'rgba(107,255,176,0.3)' : 'rgba(255,107,107,0.3)'}`,
        }}>
          <strong style={{ fontSize: '13px', color: functional ? 'var(--success)' : 'var(--danger)' }}>
            {functional ? '✓ Plausibly functional anatomy' : '✕ Anatomy stops functioning'}
          </strong>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '6px 0 0' }}>
            {functional
              ? "The pupil's light-gathering area and the lungs' gas-exchange surface area both stay in a biologically sensible range."
              : 'The pupil aperture and alveolar surface area both scale with p in ways that push them far outside any biologically workable range — vision and breathing as we know them could not function at this value.'}
          </p>
        </div>
      </div>
    </section>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
      <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ fontFamily: 'monospace' }}>{value}</span>
    </div>
  );
}
