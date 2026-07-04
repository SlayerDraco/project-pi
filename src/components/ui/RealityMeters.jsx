import { motion } from 'framer-motion';
import { useRealityStore } from '../../state/useRealityStore.js';

const METER_DEFS = [
  { key: 'geometryIntegrity', label: 'Geometry', icon: '📐' },
  { key: 'engineeringReliability', label: 'Engineering', icon: '🏗️' },
  { key: 'biologicalViability', label: 'Biology', icon: '🧬' },
  { key: 'planetaryStability', label: 'Planets', icon: '🪐' },
  { key: 'cosmicConsistency', label: 'The Cosmos', icon: '✨' },
  { key: 'absurdity', label: 'Absurdity', icon: '🤪' },
];

export default function RealityMeters() {
  const meters = useRealityStore((s) => s.meters());

  return (
    <div className="glass" style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <span style={{ fontSize: '13px', fontWeight: 600 }}>
        🌐 How's reality holding up?
      </span>
      {METER_DEFS.map((m) => {
        const value = Number.isFinite(meters[m.key]) ? meters[m.key] : 0;
        return (
          <div key={m.key}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '5px' }}>
              <span>{m.icon} {m.label}</span>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{value.toFixed(0)}%</span>
            </div>
            <div style={{ height: '8px', borderRadius: '999px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
              <motion.div
                animate={{ width: `${value}%` }}
                transition={{ type: 'spring', stiffness: 80, damping: 20 }}
                style={{
                  height: '100%', borderRadius: '999px',
                  background: barColor(m.key, value),
                  boxShadow: `0 0 12px ${barColor(m.key, value)}`,
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
