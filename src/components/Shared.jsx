import { useState, useEffect, useRef } from 'react';
import { DB } from '../db.js';

/**
 * SmartSelect – searchable dropdown untuk memilih dokumen kerja sama.
 * Props: type ('i' | 'p'), onSelect(doc), onClear()
 */
export function SmartSelect({ type, onSelect, onClear }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const wrapRef = useRef(null);

  const docs = (DB.kerjasama || []).filter(d => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      (d.nomor || '').toLowerCase().includes(q) ||
      (d.judul || '').toLowerCase().includes(q) ||
      (d.mitra || '').toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (doc) => {
    setSelected(doc);
    setOpen(false);
    setQuery('');
    onSelect(doc);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setSelected(null);
    onClear();
  };

  return (
    <div className="ss-wrap" ref={wrapRef}>
      <button
        type="button"
        className={`ss-trigger${open ? ' open' : ''}`}
        onClick={() => setOpen(!open)}
      >
        <span className={`ss-val${!selected ? ' placeholder' : ''}`}>
          {selected ? `${selected.nomor} - ${selected.judul}` : 'Pilih nomor dokumen...'}
        </span>
        {selected && (
          <span className="ss-clear mi" onClick={handleClear}>close</span>
        )}
        <span className="ss-arrow mi small">expand_more</span>
      </button>

      {open && (
        <div className="ss-panel on">
          <div className="ss-search-wrap">
            <input
              className="ss-search"
              autoFocus
              placeholder="Cari nomor, judul, atau mitra..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              onClick={e => e.stopPropagation()}
            />
          </div>
          <div className="ss-list">
            {docs.length === 0 ? (
              <div className="ss-empty">Dokumen tidak ditemukan</div>
            ) : docs.map(d => (
              <div key={d.nomor} className="ss-item" onClick={() => handleSelect(d)}>
                <div className="ss-no">
                  {d.nomor}
                  <span className={`status-badge st-${(d.status || '').toLowerCase()}`}>{d.status}</span>
                </div>
                <div className="ss-ttl">{d.judul}</div>
                <div className="ss-mtr">{d.mitra}</div>
              </div>
            ))}
          </div>
          <div className="ss-count">{docs.length} dokumen</div>
        </div>
      )}
    </div>
  );
}

/**
 * ChipInput – input yang menambah chips saat tekan Enter.
 * Props: chips (string[]), onChange(chips)
 */
export function ChipInput({ chips, onChange, placeholder = 'Ketik, tekan Enter untuk tambah...' }) {
  const [inputVal, setInputVal] = useState('');
  const boxRef = useRef(null);

  const handleKey = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = inputVal.trim();
      if (val && !chips.includes(val)) onChange([...chips, val]);
      setInputVal('');
    }
  };

  const removeChip = (i) => onChange(chips.filter((_, idx) => idx !== i));

  return (
    <div className="chip-input-box" onClick={() => boxRef.current?.focus()}>
      {chips.map((c, i) => (
        <span key={i} className="chip">
          {c}
          <button type="button" className="chip-remove" onClick={() => removeChip(i)}>&times;</button>
        </span>
      ))}
      <input
        ref={boxRef}
        value={inputVal}
        onChange={e => setInputVal(e.target.value)}
        onKeyDown={handleKey}
        placeholder={chips.length === 0 ? placeholder : ''}
      />
    </div>
  );
}

/**
 * SatkerChipInput – dropdown + chip untuk memilih satker terkait.
 * Props: selected ({kode,nama}[]), onChange(list)
 */
export function SatkerChipInput({ selected, onChange }) {
  const [query, setQuery] = useState('');
  const [ddOpen, setDdOpen] = useState(false);
  const wrapRef = useRef(null);

  const filtered = (DB.satker || [])
    .filter(s => {
      if (!query) return true;
      const q = query.toLowerCase();
      return s.kode.toLowerCase().includes(q) || (s.nama && s.nama.toLowerCase().includes(q));
    })
    .slice(0, 20);

  useEffect(() => {
    const h = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setDdOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const addSatker = (s) => {
    if (!selected.find(x => x.kode === s.kode)) onChange([...selected, s]);
    setQuery('');
    setDdOpen(false);
  };

  const remove = (i) => onChange(selected.filter((_, idx) => idx !== i));

  return (
    <div className="chip-input-wrap" style={{ position: 'relative' }} ref={wrapRef}>
      <div className="chip-input-box" onClick={() => { setDdOpen(true); }}>
        {selected.map((s, i) => (
          <span key={s.kode} className="chip">
            {s.kode}
            <button type="button" className="chip-remove" onClick={() => remove(i)}>&times;</button>
          </span>
        ))}
        <input
          type="text"
          value={query}
          placeholder={selected.length === 0 ? 'Pilih satker...' : ''}
          autoComplete="off"
          onChange={e => { setQuery(e.target.value); setDdOpen(true); }}
          onFocus={() => setDdOpen(true)}
        />
      </div>
      {ddOpen && filtered.length > 0 && (
        <div className="chip-dd on">
          {filtered.map(s => (
            <div key={s.kode} className="chip-dd-item" onMouseDown={() => addSatker(s)}>
              <div className="chip-dd-code">{s.kode}</div>
              <div className="chip-dd-name">{s.nama || ''}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * FileUpload – drag & drop zone untuk file PDF.
 * Props: files (File[]), onChange(files)
 */
export function FileUpload({ files, onChange }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const addFiles = (newFiles) => {
    const pdfs = Array.from(newFiles).filter(f => f.type === 'application/pdf');
    onChange([...files, ...pdfs]);
  };

  return (
    <>
      <div
        className={`upload-area${dragging ? ' drag' : ''}`}
        onClick={() => inputRef.current.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
      >
        <div className="upload-icon">📎</div>
        <div className="upload-text">Klik atau seret berkas ke sini</div>
        <div className="upload-sub">Format: PDF · Bisa multiple file</div>
      </div>
      <input ref={inputRef} type="file" accept=".pdf" multiple style={{ display: 'none' }} onChange={e => addFiles(e.target.files)} />
      <div className="file-list">
        {files.map((f, i) => (
          <div key={i} className="file-item">
            <span className="file-icon">📄</span>
            <span className="file-name">{f.name}</span>
            <span className="file-size">{(f.size / 1024).toFixed(1)} KB</span>
            <button type="button" className="file-rm" onClick={() => onChange(files.filter((_, j) => j !== i))}>&times;</button>
          </div>
        ))}
      </div>
    </>
  );
}

/**
 * Toast notification component.
 */
export function Toast({ message }) {
  return (
    <div className={`toast${message ? ' show' : ''}`}>{message}</div>
  );
}
