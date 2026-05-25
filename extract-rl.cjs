const XLSX = require('xlsx');
const fs = require('fs');

const filePath = '/Users/gebbygeovany/.gemini/antigravity/scratch/react-monev/dataset/Dataset_Ruang_Lingkup_gby.xlsx';

try {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet);

  console.log('First 3 rows:');
  console.log(JSON.stringify(data.slice(0, 3), null, 2));
  console.log('Total rows:', data.length);
  console.log('Columns:', Object.keys(data[0] || {}));

  // Group by nomor/index dokumen and collect kategori
  const rlMap = {};
  data.forEach((row, idx) => {
    const nomor = row['Index_Dokumen'] || row['Nomor_Dokumen'] || row['index_dokumen'] || row['nomor_dokumen'];
    const kategori = row['Kategori_Ruang_Lingkup'] || row['kategori_ruang_lingkup'] || row['Kategori'] || '';

    if (nomor && kategori) {
      if (!rlMap[nomor]) {
        rlMap[nomor] = [];
      }
      if (!rlMap[nomor].includes(kategori)) {
        rlMap[nomor].push(kategori);
      }
    }
  });

  console.log('\nSample mapping:');
  const sample = Object.entries(rlMap).slice(0, 3);
  sample.forEach(([nomor, categories]) => {
    console.log(`  ${nomor}: ${JSON.stringify(categories)}`);
  });

  console.log('\nTotal unique dokumen:', Object.keys(rlMap).length);
  console.log('Total category entries:', Object.values(rlMap).reduce((sum, arr) => sum + arr.length, 0));

  // Save to a temporary JSON file for inspection
  fs.writeFileSync('/tmp/rl_data.json', JSON.stringify(rlMap, null, 2));
  console.log('\nData saved to /tmp/rl_data.json for inspection');

} catch (error) {
  console.error('Error:', error.message);
}
