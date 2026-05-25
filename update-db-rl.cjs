const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const filePath = '/Users/gebbygeovany/.gemini/antigravity/scratch/react-monev/dataset/Dataset_Ruang_Lingkup_gby.xlsx';
const dbPath = '/Users/gebbygeovany/.gemini/antigravity/scratch/react-monev/src/db.js';

try {
  // Read Excel file
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet);

  // Build ruang_lingkup map
  const rlMap = {};
  data.forEach((row) => {
    const nomor = row['Index_Dokumen'];
    const kategori = row['Kategori_Ruang_Lingkup'];

    if (nomor && kategori) {
      if (!rlMap[nomor]) {
        rlMap[nomor] = [];
      }
      if (!rlMap[nomor].includes(kategori)) {
        rlMap[nomor].push(kategori);
      }
    }
  });

  // Read current db.js
  let dbContent = fs.readFileSync(dbPath, 'utf8');

  // Find and replace ruang_lingkup section
  const rlStart = dbContent.indexOf('"ruang_lingkup": {');
  if (rlStart === -1) {
    console.error('Could not find ruang_lingkup section in db.js');
    process.exit(1);
  }

  // Find the closing brace for ruang_lingkup
  let depth = 0;
  let rlEnd = rlStart + '"ruang_lingkup": {'.length;
  let inString = false;
  let escapeNext = false;

  for (let i = rlStart + '"ruang_lingkup": {'.length; i < dbContent.length; i++) {
    const char = dbContent[i];
    const prevChar = i > 0 ? dbContent[i - 1] : '';

    if (escapeNext) {
      escapeNext = false;
      continue;
    }

    if (char === '\\') {
      escapeNext = true;
      continue;
    }

    if (char === '"' && prevChar !== '\\') {
      inString = !inString;
      continue;
    }

    if (!inString) {
      if (char === '{') depth++;
      else if (char === '}') {
        depth--;
        if (depth === 0) {
          rlEnd = i + 1;
          break;
        }
      }
    }
  }

  // Generate new ruang_lingkup section
  const rlJson = JSON.stringify(rlMap, null, 4).replace(/^/gm, '    ');
  const newRlSection = `"ruang_lingkup": ${rlJson}`;

  // Replace in content
  const before = dbContent.substring(0, rlStart);
  const after = dbContent.substring(rlEnd);
  const newContent = before + newRlSection + after;

  // Write back
  fs.writeFileSync(dbPath, newContent, 'utf8');

  console.log('✅ Successfully updated ruang_lingkup in db.js');
  console.log(`   Total dokumen: ${Object.keys(rlMap).length}`);
  console.log(`   Total kategori entries: ${Object.values(rlMap).reduce((sum, arr) => sum + arr.length, 0)}`);

  // Show sample
  const sample = Object.entries(rlMap).slice(0, 3);
  console.log('\n   Sample:');
  sample.forEach(([nomor, cats]) => {
    console.log(`     ${nomor}: [${cats.slice(0, 2).join(', ')}${cats.length > 2 ? ', ...' : ''}]`);
  });

} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
