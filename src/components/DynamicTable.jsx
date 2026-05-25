// Convert snake_case / header keys to natural language labels
function toLabel(key) {
  return key.replace(/_/g, ' ');
}

export default function DynamicTable({ headers, rows }) {
  if (!headers?.length || !rows?.length) {
    return <div className="rekap-empty-tab">Data kosong.</div>;
  }

  return (
    <div className="table-wrapper table-full">
      <table className="rekap-table">
        <thead>
          <tr>
            <th style={{ width: 44, textAlign: 'center' }}>No.</th>
            {headers.map(h => <th key={h}>{toLabel(h)}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              <td style={{ textAlign: 'center', color: 'var(--on-surface-variant)', fontSize: 12 }}>{i + 1}</td>
              {headers.map(h => (
                <td key={h} className="td-text">{row[h] ?? ''}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
