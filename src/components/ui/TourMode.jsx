import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRealityStore } from '../../state/useRealityStore.js';

/**
 * Education Engine — Guided Tour
 * -----------------------------------------------------
 * A curated sequence of interesting π values, each with a one-line
 * framing, auto-advancing every few seconds. This is the "museum guide"
 * experience: someone who doesn't know what to type can just watch.
 */
const TOUR_STOPS = [
  { value: 'pi', label: 'Real π', note: 'Where we start. Everything checks out.' },
  { value: '2', label: 'π = 2', note: 'The smallest π where circles still exist at all.' },
  { value: '22/7', label: 'π = 22/7', note: 'The ancient approximation — close, but not quite real π.' },
  { value: 'phi', label: 'π = φ (golden ratio)', note: 'What if the circle constant were the golden ratio instead?' },
  { value: '10', label: 'π = 10', note: 'A "nice round" π. Reality strongly disagrees.' },
  { value: '2+3i', label: 'π = 2+3i', note: 'A complex π — geometry gives way to spirals.' },
  { value: '100', label: 'π = 100', note: 'Reality Destroyer territory.' },
  { value: 'Infinity', label: 'π = ∞', note: 'The ultimate limiting case.' },
  { value: 'pi', label: 'Back to real π', note: 'Home again. Everything about our universe depended on this one number.' },
];

const STOP_DURATION_MS = 5200;

export default function TourMode({ onExit }) {
  const simulate = useRealityStore((s) => s.simulate);
  const unlockAchievement = useRealityStore((s) => s.unlockAchievement);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef();

  useEffect(() => {
    simulate(TOUR_STOPS[index].value);
    if (index === TOUR_STOPS.length - 1) {
      unlockAchievement('tour-guide');
    }
  }, [index]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (paused) return undefined;
    timerRef.current = setTimeout(() => {
      setIndex((i) => (i + 1 < TOUR_STOPS.length ? i + 1 : i));
    }, STOP_DURATION_MS);
    return () => clearTimeout(timerRef.current);
  }, [index, paused]);

  const isLast = index === TOUR_STOPS.length - 1;
  const stop = TOUR_STOPS[index];

  return (
    <div style={styles.bar} role="status" aria-live="polite">
      <div style={styles.progressTrack}>
        {TOUR_STOPS.map((_, i) => (
          <div key={i} style={{ ...styles.progressDot, opacity: i <= index ? 1 : 0.25 }} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.4 }}
          style={styles.textBlock}
        >
          <strong style={{ fontSize: '13px' }}>{stop.label}</strong>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{stop.note}</span>
        </motion.div>
      </AnimatePresence>

      <div style={styles.controls}>
        <button onClick={() => setPaused((v) => !v)} style={styles.iconBtn} aria-label={paused ? 'Resume tour' : 'Pause tour'}>
          {paused ? '▶' : '⏸'}
        </button>
        <button
          onClick={() => setIndex((i) => Math.min(i + 1, TOUR_STOPS.length - 1))}
          style={styles.iconBtn}
          aria-label="Next stop"
          disabled={isLast}
        >
          ⏭
        </button>
        <button onClick={onExit} style={styles.exitBtn}>Exit Tour</button>
      </div>
    </div>
  );
}

const styles = {
  bar: {
    position: 'sticky', top: '12px', zIndex: 40,
    display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
    padding: '12px 18px', borderRadius: '999px',
    background: 'rgba(10,10,14,0.85)', border: '1px solid var(--border-glass)',
    backdropFilter: 'blur(16px)', marginBottom: '20px',
  },
  progressTrack: { display: 'flex', gap: '4px' },
  progressDot: { width: '6px', height: '6px', borderRadius: '999px', background: 'var(--accent)' },
  textBlock: { display: 'flex', flexDirection: 'column', flex: 1, minWidth: '180px' },
  controls: { display: 'flex', gap: '6px', alignItems: 'center' },
  iconBtn: {
    width: '30px', height: '30px', borderRadius: '999px', border: '1px solid var(--border-glass)',
    background: 'transparent', color: 'var(--text-primary)', fontSize: '12px',
  },
  exitBtn: {
    padding: '6px 14px', borderRadius: '999px', border: '1px solid var(--border-glass)',
    background: 'transparent', color: 'var(--text-secondary)', fontSize: '12px',
  },
};

export { TOUR_STOPS };
