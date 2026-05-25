const XLSX = require('xlsx');

const kerjasamaFile = './dataset/Dataset_Kerjasama.xlsx';
const kerjasamaWb = XLSX.readFile(kerjasamaFile);
const kerjasamaData = XLSX.utils.sheet_to_json(kerjasamaWb.Sheets[kerjasamaWb.SheetNames[0]]);

console.log(`📋 Dataset_Kerjasama Structure\n`);
console.log(`Total records: ${kerjasamaData.length}`);
console.log(`Columns: ${Object.keys(kerjasamaData[0] || {}).join(', ')}\n`);

console.log(`First record:`);
console.log(JSON.stringify(kerjasamaData[0], null, 2));

// Check status values
const statuses = [...new Set(kerjasamaData.map(r => r.Status))];
console.log(`\nUnique Status values: ${statuses.join(', ')}`);

// Check jenis dokumen
const jenis = [...new Set(kerjasamaData.map(r => r.Jenis_Dokumen))];
console.log(`Unique Jenis_Dokumen values: ${jenis.join(', ')}`);

// Check dates
console.log(`\nSample Tgl_Selesai values:`);
kerjasamaData.slice(0, 5).forEach(r => {
  console.log(`  ${r.Nomor_Dokumen}: ${r.Tgl_Selesai}`);
});
