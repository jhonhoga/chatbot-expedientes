import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import dotenv from 'dotenv';

// Only load dotenv in development
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

// Validate environment variables
const requiredEnvVars = [
  'GOOGLE_SHEET_ID',
  'GOOGLE_SERVICE_ACCOUNT_EMAIL',
  'GOOGLE_PRIVATE_KEY'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

let doc = null;

function processPrivateKey(key) {
  // Si la clave ya está en formato correcto, retornarla como está
  if (key.includes('-----BEGIN PRIVATE KEY-----')) {
    return key.replace(/\\n/g, '\n');
  }
  
  // Si la clave está en formato base64, convertirla al formato PEM
  const header = '-----BEGIN PRIVATE KEY-----\n';
  const footer = '\n-----END PRIVATE KEY-----\n';
  return header + key.replace(/[^\w\d/+=]/g, '').replace(/(.{64})/g, '$1\n') + footer;
}

export async function initializeSheet() {
  try {
    const privateKey = processPrivateKey(process.env.GOOGLE_PRIVATE_KEY);
    console.log('Private key format:', privateKey.slice(0, 50) + '...');

    const credentials = {
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    };

    const jwt = new JWT(credentials);
    doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, jwt);
    await doc.loadInfo();
    console.log('Google Sheets connection initialized successfully');
  } catch (error) {
    console.error('Error initializing Google Sheets:', error);
    throw error;
  }
}

async function getSheetData() {
  if (!doc) {
    throw new Error('Google Sheets not initialized');
  }

  const sheet = doc.sheetsByIndex[0];
  console.log('Sheet title:', sheet.title);
  console.log('Total rows:', sheet.rowCount);
  
  await sheet.loadCells();
  const rows = await sheet.getRows();
  console.log('Rows loaded:', rows.length);
  
  // Log raw data for debugging
  if (rows.length > 0) {
    console.log('First row raw data:', rows[0]._rawData);
    console.log('First row properties:', Object.getOwnPropertyNames(rows[0]));
    
    // Try to access the first cell value directly
    const a1Cell = sheet.getCell(0, 0);
    console.log('First cell value:', a1Cell.value);
    
    // Get header row
    const headerRow = [];
    for (let i = 0; i < sheet.columnCount; i++) {
      const cell = sheet.getCell(0, i);
      headerRow.push(cell.value);
    }
    console.log('Header row:', headerRow);
    
    // Get first data row
    const firstDataRow = [];
    for (let i = 0; i < sheet.columnCount; i++) {
      const cell = sheet.getCell(1, i);
      firstDataRow.push(cell.value);
    }
    console.log('First data row:', firstDataRow);
  }
  
  return rows;
}

export async function searchByRadicado(radicado) {
  try {
    console.log('Searching by radicado:', radicado);
    const rows = await getSheetData();
    
    const result = rows.find(row => {
      const rowData = row._rawData;
      const rowRadicado = rowData[0]; // Assuming radicado is in the first column
      console.log('Comparing radicado:', rowRadicado, 'with:', radicado);
      return rowRadicado && rowRadicado.toString().toLowerCase() === radicado.toLowerCase();
    });

    if (!result) {
      console.log('No results found for radicado:', radicado);
      return {
        found: false,
        message: 'No se encontró ningún registro con ese número de radicado.'
      };
    }

    const rowData = result._rawData;
    console.log('Found result row data:', rowData);
    
    return {
      found: true,
      data: {
        radicado: rowData[0] || 'No disponible',
        fecha: rowData[1] || 'No disponible',
        asunto: rowData[2] || 'No disponible',
        asignado: rowData[3] || 'No asignado',
        estado: rowData[4] || 'Sin estado',
        fechaEstimada: rowData[5] || 'No definida',
        respuesta: rowData[6] || 'Sin respuesta',
        enlace: formatUrl(rowData[7])
      }
    };
  } catch (error) {
    console.error('Error searching by radicado:', error);
    throw error;
  }
}

export async function searchByAsunto(keyword) {
  try {
    console.log('Searching by asunto:', keyword);
    const rows = await getSheetData();
    
    const results = rows.filter(row => {
      const rowData = row._rawData;
      const asunto = rowData[2]; // Assuming asunto is in the third column
      console.log('Checking asunto:', asunto);
      return asunto && asunto.toLowerCase().includes(keyword.toLowerCase());
    });

    console.log('Found results for asunto:', results.length);
    
    if (results.length === 0) {
      return {
        found: false,
        message: 'No se encontraron registros que coincidan con la búsqueda.'
      };
    }

    return {
      found: true,
      data: results.map(row => {
        const rowData = row._rawData;
        return {
          radicado: rowData[0] || 'No disponible',
          fecha: rowData[1] || 'No disponible',
          asunto: rowData[2] || 'No disponible',
          asignado: rowData[3] || 'No asignado',
          estado: rowData[4] || 'Sin estado',
          fechaEstimada: rowData[5] || 'No definida',
          respuesta: rowData[6] || 'Sin respuesta',
          enlace: formatUrl(rowData[7])
        };
      })
    };
  } catch (error) {
    console.error('Error searching by asunto:', error);
    throw error;
  }
}

function formatUrl(url) {
  if (!url) return 'No disponible';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `https://drive.google.com/file/d/${url}/view`;
}
