import { useState } from 'react';
import { useRealityStore } from '../../state/useRealityStore.js';

export default function ShareButton() {
  const rawInput = useRealityStore((s) => s.rawInput);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = new URL(window.location.href);
    url.searchParams.set('pi', rawInput);
    try {
      await navigator.clipboard.writeText(url.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard API unavailable — fail silently, non-critical feature.
    }
  };

  return (
    <button onClick={handleShare} style={styles.btn} aria-label="Copy shareable link for this reality">
      {copied ? 'Link copied ✓' : 'Share this reality'}
    </button>
  );
}

const styles = {
  btn: {
    padding: '8px 16px', borderRadius: '999px', fontSize: '13px',
    border: '1px solid var(--border-glass)', background: 'transparent', color: 'var(--text-secondary)',
  },
};
