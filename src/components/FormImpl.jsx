import { useState } from 'react';
import { DB } from '../db.js';
import { SmartSelect, SatkerChipInput, FileUpload } from './Shared.jsx';

const EMPTY = {
  nomor: '', jenis: '', judul: '', mitra: '',
  kegiatan: '', tgl: '', kendala: '', ket: '',
  satkerTerkait: [], files: [], rl: [],
};

export default function FormImpl({ uker, onSave, toast }) {
  const [form, setForm] = useState({ ...EMPTY, uker });
  const [rlItems, setRlItems] = useState([]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleDocSelect = (doc) => {
    setForm(f => ({ ...f, nomor: doc.nomor, jenis: doc.jenis, judul: doc.judul, mitra: doc.mitra }));
    const rls = DB.ruang_lingkup?.[doc.nomor];
    setRlItems(Array.isArray(rls) ? rls : []);
  };

  const handleDocClear = () => {
    setForm(f => ({ ...f, nomor: '', jenis: '', judul: '', mitra: '', rl: [] }));
    setRlItems([]);
  };

  const toggleRL = (idx) => {
    setForm(f => {
      const cur = f.rl.includes(idx) ? f.rl.filter(x => x !== idx) : [...f.rl, idx];
      return { ...f, rl: cur };
    });
  };

  const handleSave = () => {
    if (!form.nomor || !form.kegiatan) { toast('Harap isi field wajib!'); return; }
    onSave({
      ...form,
      satkerTerkait: form.satkerTerkait.map(s => s.kode).join(';'),
      rl: form.rl.map(i => rlItems[i]),
      files: form.files.length,
    });
    setForm({ ...EMPTY, uker });
    setRlItems([]);
  };

  const handleClear = () => { setForm({ ...EMPTY, uker }); setRlItems([]); };

  return (
    <div className="form-card">
      <div className="form-card-header">
        <span className="mi">add_circle_outline</span>
        <span className="form-card-title">Tambah Entri Implementasi</span>
      </div>
      <div className="form-card-body">
        <div className="info-box">
          <span className="mi small">info</span>
          <span>Pilih Nomor Dokumen untuk mengisi field lainnya secara otomatis</span>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label>Nomor Dokumen <span className="req">*</span></label>
            <SmartSelect type="i" onSelect={handleDocSelect} onClear={handleDocClear} />
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
          <label>Mitra</label>
          <input type="text" readOnly value={form.mitra} placeholder="Otomatis dari nomor dokumen" />
        </div>

        <div className="form-field">
          <label>Implementasi Kerja Sama <span className="req">*</span></label>
          <textarea
            value={form.kegiatan}
            onChange={e => set('kegiatan', e.target.value)}
            placeholder="Uraikan kegiatan implementasi yang telah dilaksanakan..."
          />
        </div>

        <div className="form-row">
          <div className="form-field">
            <label>Tanggal Implementasi</label>
            <input type="date" value={form.tgl} onChange={e => set('tgl', e.target.value)} />
          </div>
          <div className="form-field">
            <label>Satker Terkait</label>
            <SatkerChipInput selected={form.satkerTerkait} onChange={val => set('satkerTerkait', val)} />
          </div>
        </div>

        <div className="form-field">
          <label>Kendala Implementasi</label>
          <textarea
            value={form.kendala}
            onChange={e => set('kendala', e.target.value)}
            placeholder="Kendala yang dihadapi (jika ada)..."
          />
        </div>

        <div className="section-label">Ruang Lingkup Kerja Sama</div>
        {rlItems.length === 0 ? (
          <div className="rl-empty">Pilih Nomor Dokumen terlebih dahulu untuk menampilkan pilihan ruang lingkup.</div>
        ) : (
          <>
            <div className="rl-grid">
              {rlItems.map((r, idx) => (
                <label key={idx} className={`rl-item${form.rl.includes(idx) ? ' checked' : ''}`}>
                  <input
                    type="checkbox"
                    checked={form.rl.includes(idx)}
                    onChange={() => toggleRL(idx)}
                  />
                  <span>{r}</span>
                </label>
              ))}
            </div>
            <p className="rl-note">Pilih ruang lingkup yang sesuai dengan kegiatan implementasi</p>
          </>
        )}

        <div className="form-field" style={{ marginTop: 20 }}>
          <label>Keterangan</label>
          <input type="text" value={form.ket} onChange={e => set('ket', e.target.value)} placeholder="Keterangan tambahan (opsional)" />
        </div>

        <div className="section-label">Dokumen Pendukung</div>
        <div className="form-field">
          <label>Upload Berkas PDF</label>
          <FileUpload files={form.files} onChange={val => set('files', val)} />
        </div>
      </div>
      <div className="form-card-footer">
        <button className="btn btn-secondary" onClick={handleClear}>Bersihkan</button>
        <button className="btn btn-primary" onClick={handleSave}>
          <span className="mi small">check</span> Simpan Entri
        </button>
      </div>
    </div>
  );
}
