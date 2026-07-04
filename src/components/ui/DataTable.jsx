export default function DataTable({ caption, rows }) {
  return (
    <table style={styles.table}>
      {caption && <caption style={styles.caption}>{caption}</caption>}
      <tbody>
        {rows.map(([label, value], i) => (
          <tr key={i} style={styles.row}>
            <th scope="row" style={styles.th}>{label}</th>
            <td style={styles.td}>{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const styles = {
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
  caption: { textAlign: 'left', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '10px', captionSide: 'top' },
  row: { borderBottom: '1px solid var(--border-glass)' },
  th: { textAlign: 'left', fontWeight: 500, color: 'var(--text-secondary)', padding: '8px 12px 8px 0' },
  td: { textAlign: 'right', fontFamily: 'monospace', padding: '8px 0' },
};
