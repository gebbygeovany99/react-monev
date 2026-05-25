import { useState } from 'react';
import { DataGrid, GridToolbarContainer, GridToolbarExport } from '@mui/x-data-grid';
import { IconButton } from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import DashboardView from './DashboardView.jsx';
import ExcelImport from './ExcelImport.jsx';
import DynamicTable from './DynamicTable.jsx';
import FormImpl from './FormImpl.jsx';
import FormPerp from './FormPerp.jsx';
import FormBaru from './FormBaru.jsx';

const TABS = [
  { key: 'dashboard', label: 'Dashboard', icon: 'bar_chart' },
  { key: 'impl',      label: 'Implementasi', label2: 'Implementasi Kerja Sama' },
  { key: 'perp',      label: 'Perpanjangan', label2: 'Dokumen Perpanjangan' },
  { key: 'baru',      label: 'Dokumen Baru',  label2: 'Dokumen Kerja Sama Baru' },
];

const TAB_COLOR = {
  dashboard: 'var(--primary)',
  impl: 'var(--primary)',
  perp: 'var(--secondary)',
  baru: 'var(--tertiary)',
};

// ─── Excel row → form entry mappers ─────────────────────────────────────────
function mapImplRow(row, i) {
  const rl = [
    row['Ruang_Lingkup_1'], row['Ruang_Lingkup_2'], row['Ruang_Lingkup_3'],
    row['Ruang_Lingkup_4'], row['Ruang_Lingkup_5'], row['Ruang_Lingkup_6'],
  ].filter(r => r && String(r).trim());

  return {
    id: `xl-impl-${i}`,
    timestamp: new Date().toISOString(),
    satker: row['Satker_Pelapor'] || '',
    uker: row['Uker_Pelapor'] || row['Satker_Pelapor'] || '',
    nomor: row['Nomor_Dokumen'] || '',
    judul: row['Judul_Dokumen'] || '',
    mitra: row['Mitra'] || '',
    kegiatan: row['Implementasi_Kerjasama'] || '',
    tgl: row['Tanggal_Implementasi'] || '',
    kendala: row['Kendala_Implementasi'] || '',
    satkerTerkait: row['Satker_Terkait'] || '',
    rl,
    ket: row['Keterangan'] || '',
    files: 0,
  };
}

function mapPerpRow(row, i) {
  return {
    id: `xl-perp-${i}`,
    timestamp: new Date().toISOString(),
    satker: row['Satker_Pelapor'] || '',
    uker: row['Uker_Pelapor'] || row['Satker_Pelapor'] || '',
    nomor: row['Nomor_Dokumen'] || '',
    judul: row['Judul_Dokumen'] || '',
    mitra: row['Mitra'] || '',
    alasan: row['Alasan_Perpanjangan'] || '',
    tglDoc: row['Tanggal_Selesai'] || '',
    status: row['Status'] || '',
    jenis: row['Jenis_Dokumen'] || '',
  };
}

function mapBaruRow(row, i) {
  return {
    id: `xl-baru-${i}`,
    timestamp: new Date().toISOString(),
    satker: row['Satker_Pelapor'] || '',
    uker: row['Uker_Pelapor'] || row['Satker_Pelapor'] || '',
    jenis: row['Jenis_Dokumen'] || '',
    kategori: row['Kategori_Kemitraan'] || '',
    mitra: row['Mitra'] || '',
    alasan: row['Alasan_Usulan_Dokumen_Baru'] || '',
    rl: row['Usulan_Ruang_Lingkup_Dokumen'] || '',
  };
}

const MAPPERS = { impl: mapImplRow, perp: mapPerpRow, baru: mapBaruRow };

// ─── Default tables (fallback when no Excel imported) ─────────────────────────
function ImplTable({ entries, onEdit, onDelete }) {
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const handleDeleteClick = (id) => {
    setDeleteConfirm(id);
  };

  const handleDeleteConfirm = () => {
    if (onDelete) onDelete(deleteConfirm);
    setDeleteConfirm(null);
  };

  const rows = entries.map((d, i) => ({
    id: d.id,
    no: i + 1,
    nomor: d.nomor,
    kegiatan: d.kegiatan,
    tgl: d.tgl || '',
    kendala: d.kendala || '',
    satkerTerkait: d.satkerTerkait || '',
    rl: d.rl?.length > 0 ? `${d.rl.length} item` : '—',
    uker: d.uker,
    _fullData: d,
  }));

  const columns = [
    { field: 'no', headerName: 'No.', width: 50, editable: false },
    { field: 'nomor', headerName: 'No. Dokumen', width: 130, editable: true },
    { field: 'kegiatan', headerName: 'Kegiatan', width: 200, editable: true },
    { field: 'tgl', headerName: 'Tgl Implementasi', width: 130, editable: true },
    { field: 'kendala', headerName: 'Kendala', width: 150, editable: true },
    { field: 'satkerTerkait', headerName: 'Satker Terkait', width: 130, editable: true },
    { field: 'rl', headerName: 'Ruang Lingkup', width: 100, editable: false },
    { field: 'uker', headerName: 'Uker', width: 100, editable: false },
    {
      field: 'actions',
      headerName: 'Aksi',
      width: 100,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <IconButton
          size="small"
          onClick={() => handleDeleteClick(params.row.id)}
          style={{ color: 'var(--error)' }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  return (
    <>
      <DataGrid
        rows={rows}
        columns={columns}
        editMode="row"
        onProcessRowUpdate={(newRow) => {
          const updated = { ...newRow._fullData, ...newRow };
          delete updated._fullData;
          if (onEdit) onEdit(newRow.id, updated);
          return newRow;
        }}
        onProcessRowUpdateError={(error) => console.error(error)}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
          },
        }}
        style={{ height: 600 }}
        sx={{
          '& .MuiDataGrid-cell:focus': {
            outline: 'none',
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: 'var(--surface-container)',
          },
        }}
      />

      {deleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--surface)', padding: 24, borderRadius: 8, maxWidth: 400 }}>
            <h3 style={{ marginTop: 0 }}>Hapus Data?</h3>
            <p>Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.</p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Batal</button>
              <button className="btn btn-error" onClick={handleDeleteConfirm}>Hapus</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function PerpTable({ entries, onEdit, onDelete }) {
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const handleDeleteClick = (id) => {
    setDeleteConfirm(id);
  };

  const handleDeleteConfirm = () => {
    if (onDelete) onDelete(deleteConfirm);
    setDeleteConfirm(null);
  };

  const rows = entries.map((d, i) => ({
    id: d.id,
    no: i + 1,
    nomor: d.nomor,
    jenis: d.jenis || '',
    tglDoc: d.tglDoc || '',
    mitra: d.mitra || '',
    alasan: d.alasan,
    uker: d.uker,
    _fullData: d,
  }));

  const columns = [
    { field: 'no', headerName: 'No.', width: 50, editable: false },
    { field: 'nomor', headerName: 'No. Dokumen', width: 130, editable: true },
    { field: 'jenis', headerName: 'Jenis', width: 120, editable: true },
    { field: 'tglDoc', headerName: 'Tgl Berakhir', width: 130, editable: true },
    { field: 'mitra', headerName: 'Mitra', width: 150, editable: true },
    { field: 'alasan', headerName: 'Alasan', width: 150, editable: true },
    { field: 'uker', headerName: 'Uker', width: 100, editable: false },
    {
      field: 'actions',
      headerName: 'Aksi',
      width: 100,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <IconButton
          size="small"
          onClick={() => handleDeleteClick(params.row.id)}
          style={{ color: 'var(--error)' }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  return (
    <>
      <DataGrid
        rows={rows}
        columns={columns}
        editMode="row"
        onProcessRowUpdate={(newRow) => {
          const updated = { ...newRow._fullData, ...newRow };
          delete updated._fullData;
          if (onEdit) onEdit(newRow.id, updated);
          return newRow;
        }}
        onProcessRowUpdateError={(error) => console.error(error)}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
          },
        }}
        style={{ height: 600 }}
        sx={{
          '& .MuiDataGrid-cell:focus': {
            outline: 'none',
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: 'var(--surface-container)',
          },
        }}
      />

      {deleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--surface)', padding: 24, borderRadius: 8, maxWidth: 400 }}>
            <h3 style={{ marginTop: 0 }}>Hapus Data?</h3>
            <p>Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.</p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Batal</button>
              <button className="btn btn-error" onClick={handleDeleteConfirm}>Hapus</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function BaruTable({ entries, onEdit, onDelete }) {
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const handleDeleteClick = (id) => {
    setDeleteConfirm(id);
  };

  const handleDeleteConfirm = () => {
    if (onDelete) onDelete(deleteConfirm);
    setDeleteConfirm(null);
  };

  const rows = entries.map((d, i) => ({
    id: d.id,
    no: i + 1,
    jenis: d.jenis,
    kategori: d.kategori,
    mitra: (d.mitra || '').split(';').filter(Boolean).join(', '),
    alasan: d.alasan,
    rl: d.rl || '—',
    uker: d.uker,
    _fullData: d,
  }));

  const columns = [
    { field: 'no', headerName: 'No.', width: 50, editable: false },
    { field: 'jenis', headerName: 'Jenis Dokumen', width: 130, editable: true },
    { field: 'kategori', headerName: 'Kategori', width: 130, editable: true },
    { field: 'mitra', headerName: 'Mitra', width: 150, editable: true },
    { field: 'alasan', headerName: 'Alasan', width: 150, editable: true },
    { field: 'rl', headerName: 'Ruang Lingkup', width: 150, editable: true },
    { field: 'uker', headerName: 'Uker', width: 100, editable: false },
    {
      field: 'actions',
      headerName: 'Aksi',
      width: 100,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <IconButton
          size="small"
          onClick={() => handleDeleteClick(params.row.id)}
          style={{ color: 'var(--error)' }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  return (
    <>
      <DataGrid
        rows={rows}
        columns={columns}
        editMode="row"
        onProcessRowUpdate={(newRow) => {
          const updated = { ...newRow._fullData, ...newRow };
          delete updated._fullData;
          if (onEdit) onEdit(newRow.id, updated);
          return newRow;
        }}
        onProcessRowUpdateError={(error) => console.error(error)}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
          },
        }}
        style={{ height: 600 }}
        sx={{
          '& .MuiDataGrid-cell:focus': {
            outline: 'none',
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: 'var(--surface-container)',
          },
        }}
      />

      {deleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--surface)', padding: 24, borderRadius: 8, maxWidth: 400 }}>
            <h3 style={{ marginTop: 0 }}>Hapus Data?</h3>
            <p>Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.</p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Batal</button>
              <button className="btn btn-error" onClick={handleDeleteConfirm}>Hapus</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Form tab panel ───────────────────────────────────────────────────────────
function FormTabPanel({ tabKey, label2, formEntries, importedData, onImport, onClearImport, onEditEntry, onDeleteEntry, uker, onAddEntry, toast }) {
  const hasImport = !!importedData;
  const hasFormEntries = formEntries.length > 0;

  const handleEdit = (id, values) => {
    if (onEditEntry) onEditEntry(tabKey, id, values);
  };

  const handleDelete = (id) => {
    if (onDeleteEntry) onDeleteEntry(tabKey, id);
  };

  const handleFormSave = (entry) => {
    if (onAddEntry) onAddEntry(tabKey, entry);
  };

  return (
    <div>
      <ExcelImport
        imported={importedData}
        onImport={onImport}
        onClear={onClearImport}
        label={label2}
      />

      {!hasImport && (
        <div style={{ marginBottom: 24 }}>
          {tabKey === 'impl' && <FormImpl uker={uker} onSave={handleFormSave} toast={toast} />}
          {tabKey === 'perp' && <FormPerp uker={uker} onSave={handleFormSave} toast={toast} />}
          {tabKey === 'baru' && <FormBaru uker={uker} onSave={handleFormSave} toast={toast} />}
        </div>
      )}

      {hasImport ? (
        <>
          <div className="rekap-source-tag imported">
            <span className="mi small">table_chart</span>
            Data dari Excel: {importedData.fileName} — {importedData.rows.length} baris
          </div>
          <DynamicTable headers={importedData.headers} rows={importedData.rows} />
        </>
      ) : hasFormEntries ? (
        <>
          <div className="rekap-source-tag form">
            <span className="mi small">edit_note</span>
            Data dari Form ({formEntries.length} entri)
          </div>
          <div className="table-wrapper">
            {tabKey === 'impl' && <ImplTable entries={formEntries} onEdit={handleEdit} onDelete={handleDelete} />}
            {tabKey === 'perp' && <PerpTable entries={formEntries} onEdit={handleEdit} onDelete={handleDelete} />}
            {tabKey === 'baru' && <BaruTable entries={formEntries} onEdit={handleEdit} onDelete={handleDelete} />}
          </div>
        </>
      ) : (
        <div className="rekap-empty-tab">
          Belum ada data. Import Excel atau isi form terlebih dahulu.
        </div>
      )}
    </div>
  );
}

// ─── Main RekapScreen ─────────────────────────────────────────────────────────
export default function RekapScreen({ data, imported, onImport, onIsiForm, onExportCSV, onExportJSON, uker, onAddEntry, toast }) {
  const [activeTab, setActiveTab] = useState('dashboard');

  // When Excel is imported, map rows to typed entries for dashboard
  const handleImport = (type, result) => {
    if (!result) { onImport(type, null); return; }
    const mapper = MAPPERS[type];
    const entries = result.rows.map((row, i) => mapper(row, i));
    onImport(type, { ...result, entries });
  };

  // Dashboard uses imported entries when available, otherwise form entries
  const dashData = {
    impl: imported.impl?.entries ?? data.impl,
    perp: imported.perp?.entries ?? data.perp,
    baru: imported.baru?.entries ?? data.baru,
  };

  const total = data.impl.length + data.perp.length + data.baru.length;
  const hasAnyImport = !!(imported.impl || imported.perp || imported.baru);
  const isEmpty = total === 0 && !hasAnyImport;

  if (isEmpty) {
    return (
      <div className="app on">
        <div className="content">
          <div className="app-container">
            <div className="rekap-empty" style={{ marginBottom: 24 }}>
              <span className="mi" style={{ fontSize: 48, color: 'var(--outline)' }}>inbox</span>
              <p>Belum ada data. Isi form atau import Excel di bawah.</p>
              <button className="btn btn-primary" onClick={onIsiForm}>
                <span className="mi small">edit</span> Mulai Isi Form
              </button>
            </div>

            {/* Allow Excel import even when empty */}
            {['impl', 'perp', 'baru'].map(key => (
              <div key={key} style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 500, fontSize: 13, marginBottom: 8, color: 'var(--on-surface-variant)' }}>
                  {TABS.find(t => t.key === key).label2}
                </div>
                <ExcelImport
                  imported={imported[key]}
                  onImport={(result) => handleImport(key, result)}
                  onClear={() => handleImport(key, null)}
                  label={TABS.find(t => t.key === key).label2}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app on">
      {/* Tabs */}
      <div className="tabs">
        {TABS.map(t => {
          const isForm = t.key !== 'dashboard';
          const importedCount = imported[t.key]?.rows.length;
          const formCount = data[t.key]?.length;
          const count = isForm ? (importedCount ?? formCount) : null;
          const hasImport = isForm && !!imported[t.key];

          return (
            <div
              key={t.key}
              className={`tab${activeTab === t.key ? ' active' : ''}`}
              style={activeTab === t.key ? { borderBottomColor: TAB_COLOR[t.key], color: TAB_COLOR[t.key] } : {}}
              onClick={() => setActiveTab(t.key)}
            >
              <span className="tab-dot" style={{ background: TAB_COLOR[t.key] }} />
              {t.label}
              {count != null && (
                <span className="tab-count" style={hasImport ? { background: 'var(--success-pale)', color: 'var(--success)' } : {}}>
                  {hasImport && '↑'}{count}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Content */}
      <div className="content">
        <div className="app-container">
          <div className="panel active">
            {activeTab === 'dashboard' && <DashboardView data={dashData} />}

            {['impl', 'perp', 'baru'].map(key => activeTab === key && (
              <FormTabPanel
                key={key}
                tabKey={key}
                label2={TABS.find(t => t.key === key).label2}
                formEntries={data[key]}
                importedData={imported[key]}
                onImport={(result) => handleImport(key, result)}
                onClearImport={() => handleImport(key, null)}
                onEditEntry={(type, id, values) => {
                  const updated = data[type].map(entry => entry.id === id ? values : entry);
                  if (type === 'impl') onIsiForm({ impl: updated, perp: data.perp, baru: data.baru });
                  else if (type === 'perp') onIsiForm({ impl: data.impl, perp: updated, baru: data.baru });
                  else onIsiForm({ impl: data.impl, perp: data.perp, baru: updated });
                }}
                onDeleteEntry={(type, id) => {
                  const updated = data[type].filter(entry => entry.id !== id);
                  if (type === 'impl') onIsiForm({ impl: updated, perp: data.perp, baru: data.baru });
                  else if (type === 'perp') onIsiForm({ impl: data.impl, perp: updated, baru: data.baru });
                  else onIsiForm({ impl: data.impl, perp: data.perp, baru: updated });
                }}
                uker={uker}
                onAddEntry={onAddEntry}
                toast={toast}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Export bar */}
      <div className="export-bar">
        <div className="export-info">
          {hasAnyImport ? (
            <span>
              Excel: {['impl','perp','baru'].map(k => imported[k]?.rows.length ?? 0).reduce((a,b) => a+b, 0)} baris
              {total > 0 && <> · Form: {total} entri</>}
            </span>
          ) : total > 0 ? (
            <span>Total <strong>{total}</strong> entri — {data.impl.length} Impl, {data.perp.length} Perp, {data.baru.length} Baru</span>
          ) : null}
        </div>
        <button className="btn btn-secondary" onClick={onExportJSON} disabled={total === 0}>
          {'{ }'} JSON
        </button>
        <button className="btn btn-primary" onClick={onExportCSV} disabled={total === 0}>
          <span className="mi small">download</span> CSV
        </button>
      </div>
    </div>
  );
}
