const fs = require('fs');
const html = fs.readFileSync('/Users/gebbygeovany/Downloads/form_monev_1.html', 'utf8');

// Find the line with `const DB={...}`
const dbMatch = html.match(/const DB=(\{.*\});/);
if (dbMatch) {
  const dbStr = dbMatch[1];
  const output = `export const DB = ${dbStr};\n\nexport const INDUK_MAP={};\nDB.satker.forEach(s=>{if(s.induk&&s.induk!=='None'){if(!INDUK_MAP[s.induk])INDUK_MAP[s.induk]=[];INDUK_MAP[s.induk].push(s);}});\n`;
  fs.writeFileSync('/Users/gebbygeovany/.gemini/antigravity/scratch/react-monev/src/db.js', output);
  console.log('Successfully extracted DB to src/db.js');
} else {
  console.error('Could not find const DB in HTML file.');
}
