import { motion, AnimatePresence } from 'framer-motion';
import { useRealityStore, ACHIEVEMENTS } from '../../state/useRealityStore.js';

export default function AchievementGallery({ onClose }) {
  const unlocked = useRealityStore((s) => s.unlockedAchievements);
  const entries = Object.entries(ACHIEVEMENTS);
  const unlockedCount = entries.filter(([id]) => unlocked.has(id)).length;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={styles.backdrop}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.98 }}
          className="glass"
          style={styles.panel}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={styles.header}>
            <h2 className="display" style={{ margin: 0, fontSize: '20px' }}>Achievements</h2>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              {unlockedCount} / {entries.length} unlocked
            </span>
          </div>

          <div style={styles.grid}>
            {entries.map(([id, ach]) => {
              const isUnlocked = unlocked.has(id);
              const isHiddenLocked = ach.hidden && !isUnlocked;
              return (
                <div key={id} style={{ ...styles.card, opacity: isUnlocked ? 1 : 0.45 }}>
                  <strong style={{ fontSize: '13px' }}>
                    {isHiddenLocked ? '??? (hidden)' : ach.title}
                  </strong>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                    {isHiddenLocked ? 'Keep exploring to discover this one.' : ach.desc}
                  </p>
                </div>
              );
            })}
          </div>

          <button onClick={onClose} style={styles.closeBtn}>Close</button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

const styles = {
  backdrop: {
    position: 'fixed', inset: 0, zIndex: 80,
    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
  },
  panel: { width: '100%', maxWidth: '640px', maxHeight: '80vh', overflowY: 'auto', padding: '24px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' },
  card: { padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)', background: 'rgba(255,255,255,0.02)' },
  closeBtn: {
    marginTop: '20px', padding: '10px 20px', borderRadius: '999px', border: '1px solid var(--border-glass)',
    background: 'transparent', color: 'var(--text-secondary)', fontSize: '13px',
  },
};
