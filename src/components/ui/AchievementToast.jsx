import { AnimatePresence, motion } from 'framer-motion';
import { useRealityStore, ACHIEVEMENTS } from '../../state/useRealityStore.js';

export default function AchievementToast() {
  const toastQueue = useRealityStore((s) => s.toastQueue);
  const dismissToast = useRealityStore((s) => s.dismissToast);
  const current = toastQueue[0];

  return (
    <div style={{ position: 'fixed', top: '24px', right: '24px', zIndex: 100 }}>
      <AnimatePresence mode="wait" onExitComplete={dismissToast}>
        {current && (
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.4 }}
            className="glass"
            style={{ padding: '14px 18px', minWidth: '260px' }}
            onAnimationComplete={() => setTimeout(dismissToast, 3200)}
          >
            <span style={{ fontSize: '10px', letterSpacing: '0.15em', color: 'var(--accent-warm)' }}>
              ACHIEVEMENT UNLOCKED
            </span>
            <p style={{ margin: '4px 0 0', fontWeight: 600, fontSize: '14px' }}>{ACHIEVEMENTS[current]?.title}</p>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>{ACHIEVEMENTS[current]?.desc}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
