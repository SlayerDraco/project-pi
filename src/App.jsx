import { Suspense, useEffect, useState } from 'react';
import OpeningScreen from './components/layout/OpeningScreen.jsx';
import InputConsole from './components/ui/InputConsole.jsx';
import RealityMeters from './components/ui/RealityMeters.jsx';
import AchievementToast from './components/ui/AchievementToast.jsx';
import CanvasErrorBoundary from './components/ui/CanvasErrorBoundary.jsx';
import ShareButton from './components/ui/ShareButton.jsx';
import AmbientToneToggle from './components/ui/AmbientToneToggle.jsx';
import TourMode from './components/ui/TourMode.jsx';
import AchievementGallery from './components/screens/AchievementGallery.jsx';
import { EXHIBITS, getExhibit } from './data/exhibitRegistry.js';
import { useRealityStore } from './state/useRealityStore.js';

export default function App() {
  const [entered, setEntered] = useState(false);
  const [activeExhibitId, setActiveExhibitId] = useState(EXHIBITS[0].id);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [tourActive, setTourActive] = useState(false);
  const visitExhibit = useRealityStore((s) => s.visitExhibit);
  const unlockedCount = useRealityStore((s) => s.unlockedAchievements.size);

  useEffect(() => {
    if (entered) visitExhibit(activeExhibitId);
  }, [entered, activeExhibitId, visitExhibit]);

  if (!entered) {
    return <OpeningScreen onBegin={() => setEntered(true)} />;
  }

  const exhibit = getExhibit(activeExhibitId);
  const Active = exhibit.Component;

  return (
    <main style={{ minHeight: '100vh', padding: '32px clamp(16px, 4vw, 48px)' }}>
      <AchievementToast />
      {galleryOpen && <AchievementGallery onClose={() => setGalleryOpen(false)} />}

      <header style={styles.header}>
        <div>
          <h1 className="display" style={{ fontSize: 'clamp(24px, 3vw, 32px)', margin: 0 }}>
            PROJECT <span style={{ background: 'linear-gradient(120deg, var(--accent), var(--accent-2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>π</span>
          </h1>
          <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
            The science museum where you get to break reality.
          </p>
        </div>
        <div style={styles.headerActions}>
          {!tourActive && (
            <button onClick={() => setTourActive(true)} style={styles.tourBtn}>
              ✨ Guided Tour
            </button>
          )}
          <AmbientToneToggle />
          <ShareButton />
          <button onClick={() => setGalleryOpen(true)} style={styles.achievementsBtn}>
            🏆 {unlockedCount}
          </button>
        </div>
      </header>

      {tourActive && <TourMode onExit={() => setTourActive(false)} />}

      <p style={{ fontSize: '11px', letterSpacing: '0.14em', color: 'var(--text-tertiary)', margin: '20px 0 10px', textTransform: 'uppercase' }}>
        Pick an exhibit
      </p>
      <nav className="exhibit-grid" style={{ marginBottom: '18px' }}>
        {EXHIBITS.map((ex) => (
          <button
            key={ex.id}
            onClick={() => setActiveExhibitId(ex.id)}
            className={`exhibit-card ${activeExhibitId === ex.id ? 'active' : ''}`}
            style={{ '--card-color': ex.color }}
            aria-pressed={activeExhibitId === ex.id}
          >
            <span className="exhibit-icon">{ex.icon}</span>
            <span className="exhibit-label">{ex.label}</span>
            <span className="exhibit-category">{ex.category}</span>
          </button>
        ))}
      </nav>

      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 24px', maxWidth: '760px' }}>
        {exhibit.description}
      </p>

      <div className="grid-2col" style={{ marginBottom: '24px' }}>
        <InputConsole />
        <RealityMeters />
      </div>

      <CanvasErrorBoundary>
        <Suspense fallback={<ExhibitLoadingState />}>
          <Active />
        </Suspense>
      </CanvasErrorBoundary>
    </main>
  );
}

function ExhibitLoadingState() {
  return (
    <div className="glass" style={{ height: '420px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Generating exhibit…</span>
    </div>
  );
}

const styles = {
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: '4px', flexWrap: 'wrap', gap: '12px',
  },
  headerActions: { display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' },
  tourBtn: {
    padding: '9px 16px', borderRadius: '999px', fontSize: '13px', fontWeight: 600,
    border: 'none', background: 'linear-gradient(120deg, var(--accent), var(--accent-2))', color: '#0a0a10',
  },
  achievementsBtn: {
    padding: '9px 16px', borderRadius: '999px', fontSize: '13px',
    border: '1px solid var(--border-glass)', background: 'var(--bg-glass)', color: 'var(--text-primary)',
  },
};
