const XLSX = require('xlsx');

const kerjasamaFile = './dataset/Dataset_Kerjasama.xlsx';
const perpFile = './files/Form_Dokumen_Perpanjangan.xlsx';

const kerjasamaWb = XLSX.readFile(kerjasamaFile);
const kerjasamaData = XLSX.utils.sheet_to_json(kerjasamaWb.Sheets[kerjasamaWb.SheetNames[0]]);

const perpWb = XLSX.readFile(perpFile);
const perpData = XLSX.utils.sheet_to_json(perpWb.Sheets[perpWb.SheetNames[0]]);

console.log(`📊 Analisis Perpanjangan 2026 (dengan kolom yang benar)\n`);

// Filter NK 2026 Aktif (gunakan Index_Dokumen dan Tanggal_Selesai)
const nkAktif2026 = kerjasamaData.filter(row => {
  const year = row.Tanggal_Selesai?.match(/\d{4}/)?.[0];
  return year === '2026' && row.Status === 'Aktif' && row.Jenis_Dokumen === 'Nota Kesepahaman';
});

console.log(`NK yang berakhir 2026 dengan Status Aktif: ${nkAktif2026.length}`);

// Filter PKS 2026 Aktif
const pksAktif2026 = kerjasamaData.filter(row => {
  const year = row.Tanggal_Selesai?.match(/\d{4}/)?.[0];
  return year === '2026' && row.Status === 'Aktif' && row.Jenis_Dokumen === 'Perjanjian Kerja Sama';
});

console.log(`PKS yang berakhir 2026 dengan Status Aktif: ${pksAktif2026.length}\n`);

// Get nomor from perp
const perpNomor = new Set(perpData.map(p => p.Nomor_Dokumen || p.nomor).filter(Boolean));
console.log(`Total perpanjangan usulan: ${perpNomor.size}\n`);

// Check NK
const nkTerdapatUsulan = nkAktif2026.filter(k => perpNomor.has(k.Index_Dokumen)).length;
const nkBelumUsulan = nkAktif2026.length - nkTerdapatUsulan;

console.log(`Status Tindak Lanjut NK 2026:`);
console.log(`  ✓ Terdapat Usulan: ${nkTerdapatUsulan}`);
console.log(`  ✗ Belum Ada Usulan: ${nkBelumUsulan}`);

// Check PKS
const pksTerdapatUsulan = pksAktif2026.filter(k => perpNomor.has(k.Index_Dokumen)).length;
const pksBelumUsulan = pksAktif2026.length - pksTerdapatUsulan;

console.log(`\nStatus Tindak Lanjut PKS 2026:`);
console.log(`  ✓ Terdapat Usulan: ${pksTerdapatUsulan}`);
console.log(`  ✗ Belum Ada Usulan: ${pksBelumUsulan}`);

// Find some NK 2026
const nk2026All = kerjasamaData.filter(row => {
  const year = row.Tanggal_Selesai?.match(/\d{4}/)?.[0];
  return year === '2026' && row.Jenis_Dokumen === 'Nota Kesepahaman';
});

console.log(`\nTotal NK (semua status) berakhir 2026: ${nk2026All.length}`);
if (nk2026All.length > 0) {
  console.log(`Sample NK 2026:`);
  nk2026All.slice(0, 3).forEach(nk => {
    console.log(`  ${nk.Index_Dokumen} (Status: ${nk.Status})`);
  });
}
