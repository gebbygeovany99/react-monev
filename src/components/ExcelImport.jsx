import { useRef } from 'react';
import * as XLSX from 'xlsx';

/**
 * Parses an Excel/CSV file and returns { headers, rows, fileName }.
 * rows is an array of plain objects keyed by header string.
 */
function parseExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'array', cellDates: true });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
        if (!raw || raw.length < 1) { reject(new Error('File kosong')); return; }

        // First non-empty row = headers
        const headers = (raw[0] || []).map(h => String(h).trim()).filter(Boolean);
        const rows = raw.slice(1)
          .filter(r => r.some(cell => cell !== '' && cell !== null && cell !== undefined))
          .map(r => {
            const obj = {};
            headers.forEach((h, i) => {
              const val = r[i];
              obj[h] = val instanceof Date
                ? val.toLocaleDateString('id-ID')
                : val === undefined ? '' : String(val);
            });
            return obj;
          });

        resolve({ headers, rows, fileName: file.name });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Gagal membaca file'));
    reader.readAsArrayBuffer(file);
  });
}

export default function ExcelImport({ imported, onImport, onClear, label }) {
  const inputRef = useRef();

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await parseExcel(file);
      onImport(result);
    } catch (err) {
      alert('Gagal membaca file: ' + err.message);
    }
    e.target.value = '';
  };

  return (
    <div className="excel-import-bar">
      {imported ? (
        <>
          <span className="mi small" style={{ color: 'var(--success)' }}>check_circle</span>
          <span className="excel-import-filename">
            {imported.fileName} — <strong>{imported.rows.length}</strong> baris, <strong>{imported.headers.length}</strong> kolom
          </span>
          <button className="btn btn-danger btn-xs" onClick={onClear}>
            <span className="mi small">delete</span> Hapus Import
          </button>
        </>
      ) : (
        <>
          <span className="excel-import-hint">Belum ada data import untuk {label}.</span>
          <button className="btn btn-secondary btn-xs" onClick={() => inputRef.current?.click()}>
            <span className="mi small">upload_file</span> Import Excel / CSV
          </button>
        </>
      )}
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        style={{ display: 'none' }}
        onChange={handleFile}
      />
    </div>
  );
}
