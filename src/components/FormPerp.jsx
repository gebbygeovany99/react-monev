import { useState } from 'react';
import { SmartSelect } from './Shared.jsx';

const EMPTY = { nomor: '', jenis: '', judul: '', tglDoc: '', mitra: '', alasan: '', uker: '' };

export default function FormPerp({ uker, onSave, toast }) {
  const [form, setForm] = useState({ ...EMPTY, uker });
  const [mitraChips, setMitraChips] = useState([]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleDocSelect = (doc) => {
    setForm(f => ({ ...f, nomor: doc.nomor, jenis: doc.jenis, judul: doc.judul, tglDoc: doc.tgl_selesai || '', mitra: doc.mitra }));
    setMitraChips(doc.mitra ? doc.mitra.split(';').map(m => m.trim()).filter(Boolean) : []);
  };

  const handleDocClear = () => {
    setForm({ ...EMPTY, uker });
    setMitraChips([]);
  };

  const handleSave = () => {
    if (!form.nomor || !form.alasan) { toast('Harap isi field wajib!'); return; }
    onSave({ ...form });
    setForm({ ...EMPTY, uker });
    setMitraChips([]);
  };

  return (
    <div className="form-card">
      <div className="form-card-header">
        <span className="mi">add_circle_outline</span>
        <span className="form-card-title">Tambah Permohonan Perpanjangan</span>
      </div>
      <div className="form-card-body">
        <div className="info-box">
          <span className="mi small">info</span>
          <span>Pilih Nomor Dokumen untuk mengisi field lainnya secara otomatis</span>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label>Nomor Dokumen <span className="req">*</span></label>
            <SmartSelect type="p" onSelect={handleDocSelect} onClear={handleDocClear} />
          </div>
          <div className="form-field">
            <label>Uker Pelapor</label>
            <input type="text" value={form.uker} onChange={e => set('uker', e.target.value)} placeholder="Kode unit kerja" />
          </div>
        </div>

        <div className="form-field">
          <label>Jenis Dokumen</label>
          <input type="text" readOnly value={form.jenis} placeholder="Otomatis dari nomor dokumen" />
        </div>
        <div className="form-field">
          <label>Judul Dokumen</label>
          <input type="text" readOnly value={form.judul} placeholder="Otomatis dari nomor dokumen" />
        </div>
        <div className="form-field">
          <label>Tanggal Selesai Dokumen</label>
          <input type="text" readOnly value={form.tglDoc} placeholder="Otomatis dari dataset" />
        </div>

        <div className="form-field">
          <label>Mitra</label>
          {mitraChips.length > 0 ? (
            <div className="chip-display">
              {mitraChips.map((m, i) => <span key={i} className="chip secondary">{m}</span>)}
            </div>
          ) : (
            <input type="text" readOnly value="" placeholder="Otomatis dari nomor dokumen" />
          )}
        </div>

        <div className="form-field">
          <label>Alasan Perpanjangan <span className="req">*</span></label>
          <textarea
            value={form.alasan}
            onChange={e => set('alasan', e.target.value)}
            placeholder="Jelaskan alasan mengapa dokumen ini perlu diperpanjang..."
          />
        </div>
      </div>
      <div className="form-card-footer">
        <button className="btn btn-secondary" onClick={() => { setForm({ ...EMPTY, uker }); setMitraChips([]); }}>Bersihkan</button>
        <button className="btn btn-primary" onClick={handleSave} style={{ background: 'var(--secondary)' }}>
          <span className="mi small">check</span> Simpan Entri
        </button>
      </div>
    </div>
  );
}
