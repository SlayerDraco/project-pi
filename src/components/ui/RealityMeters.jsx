import { motion } from 'framer-motion';
import { useRealityStore } from '../../state/useRealityStore.js';

const METER_DEFS = [
  { key: 'geometryIntegrity', label: 'Geometry Integrity' },
  { key: 'engineeringReliability', label: 'Engineering Reliability' },
  { key: 'biologicalViability', label: 'Biological Viability' },
  { key: 'planetaryStability', label: 'Planetary Stability' },
  { key: 'cosmicConsistency', label: 'Cosmic Consistency' },
  { key: 'absurdity', label: 'Absurdity Level' },
];

export default function RealityMeters() {
  const meters = useRealityStore((s) => s.meters());

  return (
    <div className="glass" style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <span style={{ fontSize: '11px', letterSpacing: '0.15em', color: 'var(--text-secondary)' }}>
        REALITY STATUS
      </span>
      {METER_DEFS.map((m) => {
        const value = Number.isFinite(meters[m.key]) ? meters[m.key] : 0;
        return (
          <div key={m.key}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
              <span>{m.label}</span>
              <span style={{ color: 'var(--text-secondary)' }}>{value.toFixed(0)}%</span>
            </div>
            <div style={{ height: '6px', borderRadius: '999px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
              <motion.div
                animate={{ width: `${value}%` }}
                transition={{ type: 'spring', stiffness: 80, damping: 20 }}
                style={{
                  height: '100%',
                  background: barColor(m.key, value),
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function barColor(key, value) {
  if (key === 'absurdity') return `hsl(${280}, 70%, ${40 + value / 4}%)`;
  const hue = value > 60 ? 150 : value > 30 ? 40 : 0;
  return `hsl(${hue}, 75%, 55%)`;
}
