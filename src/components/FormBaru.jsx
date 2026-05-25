import { useState } from 'react';
import { DB } from '../db.js';
import { ChipInput } from './Shared.jsx';

const EMPTY = { jenis: '', kategori: '', mitra: [], alasan: '', rl: '', uker: '' };

export default function FormBaru({ uker, onSave, toast }) {
  const [form, setForm] = useState({ ...EMPTY, uker });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSave = () => {
    if (!form.jenis || !form.kategori || form.mitra.length === 0 || !form.alasan) {
      toast('Harap isi field wajib!');
      return;
    }
    onSave({ ...form, mitra: form.mitra.join(';') });
    setForm({ ...EMPTY, uker });
  };

  return (
    <div className="form-card">
      <div className="form-card-header">
        <span className="mi">add_circle_outline</span>
        <span className="form-card-title">Tambah Usulan Dokumen Baru</span>
      </div>
      <div className="form-card-body">
        <div className="form-row">
          <div className="form-field">
            <label>Jenis Dokumen <span className="req">*</span></label>
            <select value={form.jenis} onChange={e => set('jenis', e.target.value)}>
              <option value="">— Pilih Jenis Dokumen —</option>
              {(DB.jenis_dokumen || []).map(j => (
                <option key={j} value={j}>{j}</option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label>Uker Pelapor</label>
            <input type="text" value={form.uker} onChange={e => set('uker', e.target.value)} placeholder="Kode unit kerja (opsional)" />
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label>Kategori Kemitraan <span className="req">*</span></label>
            <select value={form.kategori} onChange={e => set('kategori', e.target.value)}>
              <option value="">— Pilih Kategori —</option>
              {(DB.kategori_kemitraan || []).map(k => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label>Mitra <span className="req">*</span></label>
            <ChipInput
              chips={form.mitra}
              onChange={val => set('mitra', val)}
              placeholder="Ketik nama mitra, Enter untuk tambah..."
            />
            <div className="help-text">Tekan Enter untuk menambah mitra</div>
          </div>
        </div>

        <div className="form-field">
          <label>Alasan Usulan Dokumen Baru <span className="req">*</span></label>
          <textarea
            value={form.alasan}
            onChange={e => set('alasan', e.target.value)}
            placeholder="Uraikan latar belakang dan kebutuhan dokumen kerja sama baru ini..."
          />
        </div>

        <div className="form-field">
          <label>Usulan Ruang Lingkup Dokumen</label>
          <textarea
            value={form.rl}
            onChange={e => set('rl', e.target.value)}
            placeholder="Uraikan ruang lingkup kerja sama yang diusulkan..."
          />
        </div>
      </div>
      <div className="form-card-footer">
        <button className="btn btn-secondary" onClick={() => setForm({ ...EMPTY, uker })}>Bersihkan</button>
        <button className="btn btn-primary" onClick={handleSave} style={{ background: 'var(--tertiary)' }}>
          <span className="mi small">check</span> Simpan Entri
        </button>
      </div>
    </div>
  );
}
