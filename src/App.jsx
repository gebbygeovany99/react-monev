import { useState, useEffect } from 'react';
import './App.css';
import { DB, INDUK_MAP } from './db.js';
import { Toast } from './components/Shared.jsx';
import FormImpl from './components/FormImpl.jsx';
import FormPerp from './components/FormPerp.jsx';
import FormBaru from './components/FormBaru.jsx';
import EntryList from './components/EntryList.jsx';
import RekapScreen from './components/RekapScreen.jsx';

const STORAGE_KEY = 'monev_data_2025';
const IMPORT_KEY = 'monev_imported_2025';

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return { impl: [], perp: [], baru: [] };
}

function loadImported() {
  try {
    const raw = localStorage.getItem(IMPORT_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return { impl: null, perp: null, baru: null };
}

// ─── Welcome / Mode Selection ─────────────────────────────────────────────
function WelcomeScreen({ onSelectMode }) {
  return (
    <div className="sk-screen">
      <div className="sk-card">
        <div className="sk-icon">🏛️</div>
        <h1>Selamat Datang</h1>
        <p>Pilih apakah Anda ingin mengisi laporan monitoring &amp; evaluasi atau melihat rekap data.</p>

        <div className="mode-buttons">
          <button
            className="btn mode-btn mode-btn-form"
            onClick={() => onSelectMode('form')}
          >
            <span className="mi">edit_note</span>
            <span className="mode-btn-label">Isi Form</span>
            <span className="mode-btn-desc">Input data monitoring &amp; evaluasi</span>
          </button>
          <button
            className="btn mode-btn mode-btn-rekap"
            onClick={() => onSelectMode('rekap')}
          >
            <span className="mi">bar_chart</span>
            <span className="mode-btn-label">Lihat Rekap</span>
            <span className="mode-btn-desc">Tampilkan data yang sudah diinput</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Satker Selection Screen ───────────────────────────────────────────────
function SatkerScreen({ onSelectSatker }) {
  const [sk, setSk] = useState('');
  const [uker, setUker] = useState('');

  const ukerOptions = INDUK_MAP[sk] || [];

  const handleContinue = () => {
    if (!sk) return;
    onSelectSatker(uker || sk);
  };

  return (
    <div className="sk-screen">
      <div className="sk-card">
        <div className="sk-icon">🏢</div>
        <h1>Pilih Satuan Kerja</h1>
        <p>Pilih satuan kerja Anda untuk melanjutkan.</p>

        <div className="form-field">
          <label>Satuan Kerja <span className="req">*</span></label>
          <select value={sk} onChange={e => { setSk(e.target.value); setUker(''); }}>
            <option value="">— Pilih Satker —</option>
            {(DB.satker || []).map(s => (
              <option key={s.kode} value={s.kode}>
                {s.kode}{s.nama ? ` — ${s.nama}` : ''}
              </option>
            ))}
          </select>
        </div>

        {ukerOptions.length > 0 && (
          <div className="form-field">
            <label>Unit Kerja (Uker)</label>
            <select value={uker} onChange={e => setUker(e.target.value)}>
              <option value="">— Pilih Uker (opsional) —</option>
              {ukerOptions.map(u => (
                <option key={u.kode} value={u.kode}>
                  {u.kode}{u.nama ? ` - ${u.nama}` : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        <button className="btn btn-primary" disabled={!sk} onClick={handleContinue} style={{ width: '100%', marginTop: 16 }}>
          <span className="mi small">arrow_forward</span> Lanjutkan
        </button>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [activeSK, setActiveSK] = useState(null);
  const [mode, setMode] = useState(null); // 'form' | 'rekap'
  const [activeTab, setActiveTab] = useState('impl');
  const [data, setData] = useState(loadData);
  const [imported, setImported] = useState(loadImported);
  const [toastMsg, setToastMsg] = useState('');

  // Persist data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    localStorage.setItem(IMPORT_KEY, JSON.stringify(imported));
  }, [imported]);

  const setImportedType = (type, value) => {
    setImported(prev => ({ ...prev, [type]: value }));
  };

  const satkerInfo = (DB.satker || []).find(s => s.kode === activeSK);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const addEntry = (type, entry) => {
    setData(d => ({ ...d, [type]: [...d[type], { ...entry, id: Date.now(), timestamp: new Date().toISOString() }] }));
    showToast('✅ Entri berhasil disimpan!');
  };

  const totalEntries = data.impl.length + data.perp.length + data.baru.length;

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `monev_${activeSK}_2025.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    let csv = 'type,nomor,kegiatan,alasan,mitra,tgl,uker\n';
    ['impl', 'perp', 'baru'].forEach(type => {
      data[type].forEach(d => {
        csv += `"${type}","${d.nomor || d.jenis || ''}","${d.kegiatan || ''}","${d.alasan || ''}","${d.mitra || ''}","${d.tgl || ''}","${d.uker || ''}"\n`;
      });
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `monev_${activeSK}_2025.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const handleSelectMode = (selectedMode) => {
    setMode(selectedMode);
  };

  const handleSelectSatker = (sk) => {
    setActiveSK(sk);
  };

  const handleGantiSatker = () => {
    setActiveSK(null);
  };

  const handleGantiMode = () => {
    setActiveSK(null);
    setMode(null);
  };

  const handleHapusSemua = () => {
    if (!window.confirm('Hapus semua data termasuk import Excel? Tindakan ini tidak dapat dibatalkan.')) return;
    setData({ impl: [], perp: [], baru: [] });
    setImported({ impl: null, perp: null, baru: null });
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(IMPORT_KEY);
    showToast('🗑️ Semua data berhasil dihapus.');
  };

  // Welcome screen (pick mode)
  if (!mode) {
    return (
      <>
        <header className="app-bar">
          <div className="app-bar-title">
            <span className="app-bar-badge">OJK</span>
            Form Monitoring &amp; Evaluasi Kerja Sama
          </div>
          <div className="app-bar-spacer">Tahun 2025</div>
        </header>
        <WelcomeScreen onSelectMode={handleSelectMode} />
      </>
    );
  }

  // Satker screen (pick satker) - skip if going to Rekap mode
  if (!activeSK && mode !== 'rekap') {
    return (
      <>
        <header className="app-bar">
          <div className="app-bar-title">
            <span className="app-bar-badge">OJK</span>
            Form Monitoring &amp; Evaluasi Kerja Sama
          </div>
          <div className="app-bar-spacer">Tahun 2025</div>
        </header>
        <SatkerScreen onSelectSatker={handleSelectSatker} />
      </>
    );
  }

  const satkerLabel = satkerInfo?.nama ? `${activeSK} — ${satkerInfo.nama}` : activeSK;

  return (
    <>
      <header className="app-bar">
        <div className="app-bar-title">
          <span className="app-bar-badge">OJK</span>
          Form Monitoring &amp; Evaluasi Kerja Sama
        </div>
        <div className="app-bar-spacer">Tahun 2025</div>
      </header>

      {/* Satker + mode bar - only show when activeSK is selected */}
      {activeSK && (
        <div className="satker-bar">
          <span className="satker-badge">{activeSK}</span>
          <span className="satker-label">{satkerInfo?.nama}</span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              className={`btn btn-mode${mode === 'form' ? ' btn-mode-active' : ''}`}
              onClick={() => setMode('form')}
              title="Isi Form"
            >
              <span className="mi small">edit_note</span> Isi Form
            </button>
            <button
              className={`btn btn-mode${mode === 'rekap' ? ' btn-mode-active' : ''}`}
              onClick={() => setMode('rekap')}
              title="Lihat Rekap"
            >
              <span className="mi small">bar_chart</span> Rekap
              {totalEntries > 0 && <span className="tab-count" style={{ marginLeft: 4 }}>{totalEntries}</span>}
            </button>
            <button className="btn btn-secondary" onClick={handleGantiSatker}>
              <span className="mi small">edit</span> Ganti Satker
            </button>
            <button className="btn btn-danger" onClick={handleHapusSemua} title="Hapus Semua Data">
              <span className="mi small">delete</span> Hapus Data
            </button>
          </div>
        </div>
      )}

      {/* Rekap mode without satker bar */}
      {mode === 'rekap' && !activeSK && (
        <div style={{ padding: '16px', display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--outline)' }}>
          <button className="btn btn-secondary" onClick={() => setMode(null)}>
            <span className="mi small">arrow_back</span> Kembali
          </button>
          <div style={{ flex: 1, textAlign: 'center', fontSize: 14, color: 'var(--on-surface-variant)' }}>
            Rekap Data Semua Satker
          </div>
          <button className="btn btn-danger" onClick={handleHapusSemua} title="Hapus Semua Data">
            <span className="mi small">delete</span> Hapus Data
          </button>
        </div>
      )}

      {/* Rekap mode */}
      {mode === 'rekap' && (
        <RekapScreen
          data={data}
          imported={imported}
          onImport={setImportedType}
          onIsiForm={() => setMode('form')}
          onExportCSV={exportCSV}
          onExportJSON={exportJSON}
          uker={activeSK}
          onAddEntry={addEntry}
          toast={showToast}
        />
      )}

      {/* Form mode */}
      {mode === 'form' && (
        <div className="app on">
          {/* Tabs */}
          <div className="tabs">
            <div
              className={`tab${activeTab === 'impl' ? ' active' : ''}`}
              onClick={() => setActiveTab('impl')}
            >
              <span className="tab-dot" style={{ background: 'var(--primary)' }} />
              Form Implementasi
              <span className="tab-count">{data.impl.length}</span>
            </div>
            <div
              className={`tab${activeTab === 'perp' ? ' active secondary' : ''}`}
              onClick={() => setActiveTab('perp')}
            >
              <span className="tab-dot" style={{ background: 'var(--secondary)' }} />
              Form Perpanjangan
              <span className="tab-count">{data.perp.length}</span>
            </div>
            <div
              className={`tab${activeTab === 'baru' ? ' active tertiary' : ''}`}
              onClick={() => setActiveTab('baru')}
            >
              <span className="tab-dot" style={{ background: 'var(--tertiary)' }} />
              Form Dokumen Baru
              <span className="tab-count">{data.baru.length}</span>
            </div>
          </div>

          {/* Panel content */}
          <div className="content">
            <div className="app-container">
              {activeTab === 'impl' && (
                <div className="panel active">
                  <div className="panel-header">
                    <h2>Form Implementasi Kerja Sama</h2>
                    <p>Catat kegiatan implementasi dari dokumen kerja sama yang aktif.</p>
                  </div>
                  <EntryList entries={data.impl} type="impl" />
                  <FormImpl uker={activeSK} onSave={e => addEntry('impl', e)} toast={showToast} />
                </div>
              )}
              {activeTab === 'perp' && (
                <div className="panel active">
                  <div className="panel-header">
                    <h2>Form Dokumen Perpanjangan</h2>
                    <p>Ajukan perpanjangan untuk dokumen kerja sama yang akan habis masa berlakunya.</p>
                  </div>
                  <EntryList entries={data.perp} type="perp" />
                  <FormPerp uker={activeSK} onSave={e => addEntry('perp', e)} toast={showToast} />
                </div>
              )}
              {activeTab === 'baru' && (
                <div className="panel active">
                  <div className="panel-header">
                    <h2>Form Dokumen Kerja Sama Baru</h2>
                    <p>Usulkan dokumen kerja sama baru (MoU, PKS, KAK, dll)</p>
                  </div>
                  <EntryList entries={data.baru} type="baru" />
                  <FormBaru uker={activeSK} onSave={e => addEntry('baru', e)} toast={showToast} />
                </div>
              )}
            </div>
          </div>

          {/* Export bar */}
          <div className="export-bar">
            <div className="export-info">
              {totalEntries === 0
                ? 'Belum ada data yang diisi.'
                : <span>Total <strong>{totalEntries}</strong> entri disimpan — {data.impl.length} Impl, {data.perp.length} Perp, {data.baru.length} Baru</span>
              }
            </div>
            <button className="btn btn-secondary" onClick={exportJSON} disabled={totalEntries === 0}>
              {'{ }'} JSON
            </button>
            <button className="btn btn-primary" onClick={exportCSV} disabled={totalEntries === 0}>
              <span className="mi small">download</span> CSV
            </button>
          </div>
        </div>
      )}

      <Toast message={toastMsg} />
    </>
  );
}
