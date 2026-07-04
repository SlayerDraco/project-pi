/**
 * UI — StatGrid / StatCard / VerdictBanner
 * -----------------------------------------------------
 * Replaces the old plain monospace label/value rows with
 * friendly, colorful, icon-led cards — the same information,
 * presented for a general audience instead of an engineering
 * spec sheet.
 */
export function StatGrid({ children }) {
  return <div className="stat-grid">{children}</div>;
}

export function StatCard({ icon, label, value, unit, sub }) {
  return (
    <div className="stat-card">
      {icon && <span className="stat-icon">{icon}</span>}
      <span className="stat-label">{label}</span>
      <span className="stat-value">
        {value}
        {unit && <span className="stat-unit">{unit}</span>}
      </span>
      {sub && <span className="stat-sub">{sub}</span>}
    </div>
  );
}

export function VerdictBanner({ good, title, children }) {
  return (
    <div className={`verdict-banner ${good ? 'good' : 'bad'}`}>
      <span className="verdict-icon">{good ? '✅' : '💥'}</span>
      <div>
        <strong style={{ fontSize: '13px', color: good ? 'var(--success)' : 'var(--danger)' }}>{title}</strong>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>{children}</p>
      </div>
    </div>
  );
}
