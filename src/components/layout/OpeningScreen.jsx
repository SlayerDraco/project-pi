import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { REAL_PI } from '../../engines/math/parser.js';

export default function OpeningScreen({ onBegin }) {
  const [digits] = useState(REAL_PI.toFixed(15));

  return (
    <AnimatePresence>
      <motion.section
        className="opening-screen"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.9, ease: 'easeInOut' } }}
        style={styles.wrap}
      >
        <div style={styles.scanline} aria-hidden="true" />
        <motion.p
          initial={{ opacity: 0, letterSpacing: '0.5em' }}
          animate={{ opacity: 1, letterSpacing: '0.35em' }}
          transition={{ duration: 1.2 }}
          style={styles.kicker}
        >
          CLASSIFIED · REALITY ENGINEERING DIVISION
        </motion.p>

        <motion.h1
          className="display"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 1 }}
          style={styles.title}
        >
          PROJECT <span style={{ color: 'var(--accent)' }}>π</span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 1 }}
          style={styles.readout}
        >
          <span style={styles.readoutLabel}>REALITY CONSTANT · CURRENT VALUE</span>
          <span style={styles.readoutValue}>π = {digits}…</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 1 }}
          style={styles.warningBox}
        >
          <strong style={{ color: 'var(--danger)' }}>⚠ WARNING</strong>
          <p style={{ margin: '8px 0 0', color: 'var(--text-secondary)' }}>
            Changing this constant will alter reality. Geometry, biology, engineering,
            and the cosmos itself are downstream of this single number. Proceed with curiosity.
          </p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onBegin}
          style={styles.button}
        >
          Begin Experiment
        </motion.button>
      </motion.section>
    </AnimatePresence>
  );
}

const styles = {
  wrap: {
    position: 'fixed', inset: 0, zIndex: 50,
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    background: 'radial-gradient(ellipse at center, #101018 0%, #060608 70%)',
    textAlign: 'center', padding: '24px',
  },
  scanline: {
    position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.03,
    background: 'repeating-linear-gradient(0deg, #fff 0px, transparent 1px, transparent 3px)',
  },
  kicker: { fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '20px' },
  title: { fontSize: 'clamp(48px, 12vw, 120px)', fontWeight: 600, margin: 0 },
  readout: {
    marginTop: '28px', display: 'flex', flexDirection: 'column', gap: '6px',
  },
  readoutLabel: { fontSize: '11px', letterSpacing: '0.2em', color: 'var(--text-secondary)' },
  readoutValue: { fontFamily: 'monospace', fontSize: 'clamp(16px, 3vw, 22px)', color: 'var(--success)' },
  warningBox: {
    marginTop: '40px', maxWidth: '480px', padding: '18px 22px',
    border: '1px solid rgba(255,107,107,0.3)', borderRadius: 'var(--radius-md)',
    background: 'rgba(255,107,107,0.05)',
  },
  button: {
    marginTop: '48px', padding: '16px 40px', fontSize: '15px', fontWeight: 500,
    borderRadius: '999px', border: '1px solid var(--border-glass)',
    background: 'var(--accent)', color: '#0a0a10',
  },
};
