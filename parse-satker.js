const XLSX = require('xlsx');

// Read the Excel file
const filePath = './dataset/Dataset_Satker.xlsx';
const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Convert to JSON
const data = XLSX.utils.sheet_to_json(worksheet);

// Format the data - keep original keys as-is for now
console.log('Parsed ' + data.length + ' satker records');
console.log('Columns:', Object.keys(data[0] || {}));
console.log('\nFirst 2 records:');
console.log(JSON.stringify(data.slice(0, 2), null, 2));
