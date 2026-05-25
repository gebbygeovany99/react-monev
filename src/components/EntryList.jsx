/**
 * EntryList – menampilkan daftar entri yang sudah disimpan.
 * Props: entries (array), type ('impl' | 'perp' | 'baru')
 */
export default function EntryList({ entries, type }) {
  if (entries.length === 0) return null;

  return (
    <div style={{ marginBottom: 24 }}>
      {entries.map((d, i) => (
        <div key={d.id || i} style={{
          background: 'var(--surface)',
          padding: '12px 16px',
          border: '1px solid var(--outline-variant)',
          borderLeft: `4px solid ${type === 'impl' ? 'var(--primary)' : type === 'perp' ? 'var(--secondary)' : 'var(--tertiary)'}`,
          borderRadius: 4,
          marginBottom: 10,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
        }}>
          <span className="mi" style={{
            color: type === 'impl' ? 'var(--primary)' : type === 'perp' ? 'var(--secondary)' : 'var(--tertiary)',
            fontSize: 20,
            marginTop: 2,
            flexShrink: 0,
          }}>
            {type === 'impl' ? 'task_alt' : type === 'perp' ? 'update' : 'add_box'}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            {type === 'impl' && (
              <>
                <div style={{ fontWeight: 500, fontSize: 14, fontFamily: 'Roboto Mono', color: 'var(--primary)' }}>{d.nomor}</div>
                <div style={{ fontSize: 14, color: 'var(--on-surface)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {d.kegiatan}
                </div>
                <div style={{ fontSize: 12, color: 'var(--on-surface-variant)', marginTop: 4, display: 'flex', gap: 12 }}>
                  <span>📅 {d.tgl || '—'}</span>
                  {d.files > 0 && <span>📎 {d.files} file</span>}
                  {d.rl?.length > 0 && <span>🔖 {d.rl.length} ruang lingkup</span>}
                </div>
              </>
            )}
            {type === 'perp' && (
              <>
                <div style={{ fontWeight: 500, fontSize: 14, fontFamily: 'Roboto Mono', color: 'var(--secondary)' }}>{d.nomor}</div>
                <div style={{ fontSize: 14, color: 'var(--on-surface)', marginTop: 2 }}>{d.alasan}</div>
                {d.tglDoc && (
                  <div style={{ fontSize: 12, color: 'var(--on-surface-variant)', marginTop: 4 }}>⏳ Berakhir: {d.tglDoc}</div>
                )}
              </>
            )}
            {type === 'baru' && (
              <>
                <div style={{ fontWeight: 500, fontSize: 14, color: 'var(--tertiary)' }}>
                  Usulan {d.jenis} — {d.kategori}
                </div>
                <div style={{ fontSize: 13, color: 'var(--on-surface-variant)', marginTop: 2 }}>
                  🤝 {d.mitra}
                </div>
                <div style={{ fontSize: 14, color: 'var(--on-surface)', marginTop: 4 }}>{d.alasan}</div>
              </>
            )}
          </div>
          <div style={{ fontSize: 11, color: 'var(--on-surface-variant)', flexShrink: 0, marginTop: 2 }}>
            {new Date(d.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      ))}
    </div>
  );
}
