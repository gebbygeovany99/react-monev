const XLSX = require('xlsx');
const fs = require('fs');

const filePath = '/Users/gebbygeovany/.gemini/antigravity/scratch/react-monev/dataset/Dataset_Ruang_Lingkup_gby.xlsx';
const dbPath = '/Users/gebbygeovany/.gemini/antigravity/scratch/react-monev/src/db.js';
const backupPath = '/Users/gebbygeovany/.gemini/antigravity/scratch/react-monev/src/db.js.backup';

try {
  // Backup current db.js
  const currentDb = fs.readFileSync(dbPath, 'utf8');
  fs.writeFileSync(backupPath, currentDb);
  console.log('Backup created at db.js.backup');

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

  // Parse the current db.js
  // Find where ruang_lingkup starts
  const dbContent = fs.readFileSync(dbPath, 'utf8');
  const rlStartIdx = dbContent.indexOf('"ruang_lingkup": {');

  if (rlStartIdx === -1) {
    console.error('Could not find "ruang_lingkup" in db.js');
    process.exit(1);
  }

  // Find the closing brace of ruang_lingkup by counting braces
  let braceCount = 0;
  let inString = false;
  let escapeNext = false;
  let rlEndIdx = -1;

  for (let i = rlStartIdx + '"ruang_lingkup": {'.length; i < dbContent.length; i++) {
    const char = dbContent[i];

    if (escapeNext) {
      escapeNext = false;
      continue;
    }

    if (char === '\\') {
      escapeNext = true;
      continue;
    }

    if (char === '"' && dbContent[i - 1] !== '\\') {
      inString = !inString;
      continue;
    }

    if (!inString) {
      if (char === '{') {
        braceCount++;
      } else if (char === '}') {
        if (braceCount === 0) {
          rlEndIdx = i;
          break;
        }
        braceCount--;
      }
    }
  }

  if (rlEndIdx === -1) {
    console.error('Could not find closing brace for ruang_lingkup');
    process.exit(1);
  }

  // Build the new ruang_lingkup JSON
  const rlJSON = JSON.stringify(rlMap, null, 2);

  // Reconstruct the db.js
  const before = dbContent.substring(0, rlStartIdx);
  const after = dbContent.substring(rlEndIdx + 1);

  // Create the new ruang_lingkup section with proper indentation
  const rlLines = rlJSON.split('\n').map((line, idx) => {
    if (idx === 0) return '  "ruang_lingkup": ' + line;
    return '  ' + line;
  }).join('\n');

  const newContent = before + rlLines + after;

  // Write back
  fs.writeFileSync(dbPath, newContent, 'utf8');

  console.log('✅ Successfully rebuilt ruang_lingkup in db.js');
  console.log(`   Total dokumen: ${Object.keys(rlMap).length}`);
  console.log(`   Total kategori entries: ${Object.values(rlMap).reduce((sum, arr) => sum + arr.length, 0)}`);

} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
