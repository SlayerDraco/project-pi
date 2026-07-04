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
        <h1 className="display" style={{ fontSize: '22px', margin: 0 }}>
          PROJECT <span style={{ color: 'var(--accent)' }}>π</span>
        </h1>
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

      <nav style={styles.nav}>
        {EXHIBITS.map((ex) => (
          <button
            key={ex.id}
            onClick={() => setActiveExhibitId(ex.id)}
            style={{
              ...styles.navBtn,
              background: activeExhibitId === ex.id ? 'var(--accent)' : 'transparent',
              color: activeExhibitId === ex.id ? '#0a0a10' : 'var(--text-secondary)',
            }}
          >
            {ex.label}
          </button>
        ))}
      </nav>

      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 24px' }}>
        {exhibit.category} · {exhibit.description}
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
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '16px', flexWrap: 'wrap', gap: '12px',
  },
  headerActions: { display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' },
  tourBtn: {
    padding: '8px 14px', borderRadius: '999px', fontSize: '13px',
    border: '1px solid var(--accent)', background: 'transparent', color: 'var(--accent)',
  },
  achievementsBtn: {
    padding: '8px 14px', borderRadius: '999px', fontSize: '13px',
    border: '1px solid var(--border-glass)', background: 'transparent', color: 'var(--text-primary)',
  },
  nav: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' },
  navBtn: { padding: '8px 16px', borderRadius: '999px', fontSize: '13px', border: '1px solid var(--border-glass)' },
};
