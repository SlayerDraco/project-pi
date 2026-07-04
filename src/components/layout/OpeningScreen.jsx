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
        <div style={styles.glow} aria-hidden="true" />

        <motion.div
          aria-hidden="true"
          style={styles.rings}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              style={{ ...styles.ring, width: 200 + i * 90, height: 200 + i * 90 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 26 + i * 10, repeat: Infinity, ease: 'linear' }}
            >
              <span style={styles.ringDot} />
            </motion.div>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0, letterSpacing: '0.5em' }}
          animate={{ opacity: 1, letterSpacing: '0.3em' }}
          transition={{ duration: 1.2 }}
          style={styles.kicker}
        >
          AN INTERACTIVE SCIENCE MUSEUM
        </motion.p>

        <motion.h1
          className="display"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 1 }}
          style={styles.title}
        >
          PROJECT <span style={styles.piGradient}>π</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          style={styles.tagline}
        >
          What if this one number were different? Not just circles —
          Earth, DNA, bridges, black holes, pizza. Everything.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
          style={styles.readout}
        >
          <span style={styles.readoutLabel}>Right now, in our universe</span>
          <span style={styles.readoutValue}>π = {digits}…</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 1 }}
          style={styles.warningBox}
        >
          <strong style={{ color: 'var(--accent-2)' }}>✨ Fair warning</strong>
          <p style={{ margin: '8px 0 0', color: 'var(--text-secondary)' }}>
            You're about to change it. Circles, planets, gears, and even your own
            DNA are all quietly built on this number — so things are going to get weird.
          </p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={onBegin}
          style={styles.button}
        >
          🚀 Let's break reality
        </motion.button>
      </motion.section>
    </AnimatePresence>
  );
}

const styles = {
  wrap: {
    position: 'fixed', inset: 0, zIndex: 50,
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    background: 'radial-gradient(ellipse 900px 700px at 50% 20%, rgba(139,124,255,0.18), transparent 60%), radial-gradient(ellipse at center, #120e1f 0%, #08060f 70%)',
    textAlign: 'center', padding: '24px', overflow: 'hidden',
  },
  glow: {
    position: 'absolute', inset: 0, pointerEvents: 'none',
    background: 'radial-gradient(circle at 50% 40%, rgba(255,124,224,0.08), transparent 55%)',
  },
  rings: {
    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
  },
  ring: {
    position: 'absolute', top: '50%', left: '50%', marginTop: '-50%', marginLeft: '-50%',
    borderRadius: '50%', border: '1px solid rgba(139,124,255,0.18)',
  },
  ringDot: {
    position: 'absolute', top: '-3px', left: '50%', width: '6px', height: '6px',
    borderRadius: '50%', background: 'var(--accent-2)', boxShadow: '0 0 10px var(--accent-2)',
  },
  kicker: { fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '18px', position: 'relative' },
  title: { fontSize: 'clamp(48px, 12vw, 120px)', fontWeight: 600, margin: 0, position: 'relative' },
  piGradient: {
    background: 'linear-gradient(120deg, var(--accent), var(--accent-2))',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  },
  tagline: {
    marginTop: '14px', maxWidth: '460px', fontSize: '15px', color: 'var(--text-secondary)',
    lineHeight: 1.5, position: 'relative',
  },
  readout: {
    marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '6px', position: 'relative',
  },
  readoutLabel: { fontSize: '11px', letterSpacing: '0.15em', color: 'var(--text-tertiary)', textTransform: 'uppercase' },
  readoutValue: { fontFamily: 'var(--font-display)', fontSize: 'clamp(18px, 3vw, 24px)', color: 'var(--success)' },
  warningBox: {
    marginTop: '32px', maxWidth: '440px', padding: '18px 22px', position: 'relative',
    border: '1px solid rgba(255,124,224,0.25)', borderRadius: 'var(--radius-md)',
    background: 'rgba(255,124,224,0.05)',
  },
  button: {
    marginTop: '40px', padding: '17px 44px', fontSize: '15px', fontWeight: 700,
    borderRadius: '999px', border: 'none', position: 'relative',
    background: 'linear-gradient(120deg, var(--accent), var(--accent-2))', color: '#0a0a10',
    boxShadow: '0 8px 30px rgba(139,124,255,0.35)',
  },
};
