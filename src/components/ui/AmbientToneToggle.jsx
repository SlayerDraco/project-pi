import { useEffect, useRef, useState } from 'react';
import { useRealityStore } from '../../state/useRealityStore.js';

/**
 * Sound design: maps the "overallStability" reality meter to a tone.
 * Stable realities (near real π) produce a calm, low, consonant tone.
 * Unstable ones produce a higher, more dissonant, wavering tone —
 * sonifying the same math the visuals already show. Off by default;
 * entirely opt-in, and stops immediately when toggled off or unmounted.
 */
export default function AmbientToneToggle() {
  const meters = useRealityStore((s) => s.meters());
  const [enabled, setEnabled] = useState(false);
  const ctxRef = useRef(null);
  const oscRef = useRef(null);
  const gainRef = useRef(null);

  useEffect(() => {
    if (!enabled) return undefined;

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return undefined;

    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    gain.gain.value = 0.04; // deliberately quiet — ambient, not intrusive
    osc.connect(gain).connect(ctx.destination);
    osc.start();

    ctxRef.current = ctx;
    oscRef.current = osc;
    gainRef.current = gain;

    // This cleanup is the ONLY place teardown happens — it runs both when
    // `enabled` flips back to false and on unmount. A previous version also
    // tried to close the context again in a separate `!enabled` branch,
    // which ran after this cleanup and crashed with "Cannot close a closed
    // AudioContext" since the context was already closed by then.
    return () => {
      osc.stop();
      ctx.close();
      ctxRef.current = null;
      oscRef.current = null;
      gainRef.current = null;
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !oscRef.current || !ctxRef.current) return;
    const stability = Number.isFinite(meters.overallStability) ? meters.overallStability : 0;
    // Stable (100) -> a calm 220Hz. Unstable (0) -> a tense 440Hz, with
    // a slight wobble via detune proportional to absurdity.
    const freq = 220 + (100 - stability) * 2.2;
    oscRef.current.frequency.setTargetAtTime(freq, ctxRef.current.currentTime, 0.3);
    oscRef.current.detune.setTargetAtTime((meters.absurdity ?? 0) * 3, ctxRef.current.currentTime, 0.3);
  }, [meters, enabled]);

  return (
    <button
      onClick={() => setEnabled((v) => !v)}
      style={{ ...styles.btn, ...(enabled ? styles.btnActive : {}) }}
      aria-pressed={enabled}
      aria-label="Toggle ambient reality-stability tone"
    >
      {enabled ? '🔊 Ambient tone on' : '🔈 Ambient tone off'}
    </button>
  );
}

const styles = {
  btn: {
    padding: '8px 14px', borderRadius: '999px', fontSize: '13px',
    border: '1px solid var(--border-glass)', background: 'transparent', color: 'var(--text-secondary)',
  },
  btnActive: { background: 'var(--accent)', color: '#0a0a10', border: '1px solid var(--accent)' },
};
