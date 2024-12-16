import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

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

console.log('Initializing Google Sheets with Sheet ID:', process.env.GOOGLE_SHEET_ID);

// Create JWT client
const serviceAccountAuth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

// Initialize the sheet
const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);

export async function initializeSheet() {
  try {
    console.log('Loading Google Sheet...');
    await doc.loadInfo();
    console.log('Google Sheets document loaded successfully');
    console.log('Document title:', doc.title);
    console.log('Sheet count:', doc.sheetCount);
    
    // Log information about each sheet
    doc.sheetsByIndex.forEach((sheet, index) => {
      console.log(`Sheet ${index}: "${sheet.title}" (${sheet.rowCount} rows)`);
    });
    
    return true;
  } catch (error) {
    console.error('Error loading Google Sheets document:', error);
    return false;
  }
}

async function getSheetData() {
  await doc.loadInfo();
  const sheet = doc.sheetsByIndex[0];
  console.log('Using sheet:', sheet.title);
  
  const rows = await sheet.getRows();
  console.log('Total rows found:', rows.length);
  
  // Get headers from the first row
  const headers = rows.length > 0 ? Object.keys(rows[0]._rawData).map((_, index) => rows[0]._rawData[index]) : [];
  console.log('Headers found:', headers);
  
  return { sheet, rows, headers };
}

export async function searchByRadicado(radicado) {
  try {
    console.log('Searching for radicado:', radicado);
    const { rows } = await getSheetData();
    
    // Log the first few rows as examples
    console.log('\nFirst 3 rows data:');
    for (let i = 0; i < Math.min(3, rows.length); i++) {
      console.log(`Row ${i + 1}:`, {
        radicado: rows[i]._rawData[0],
        asunto: rows[i]._rawData[2]
      });
    }
    
    const result = rows.find(row => {
      const rowRadicado = String(row._rawData[0] || '').trim(); // Convert to string and trim whitespace
      const searchRadicado = String(radicado).trim(); // Convert search term to string and trim whitespace
      console.log('Comparing:', `"${rowRadicado}"`, 'with:', `"${searchRadicado}"`);
      return rowRadicado.toLowerCase() === searchRadicado.toLowerCase();
    });
    
    if (!result) {
      console.log('No matching radicado found');
      return { found: false, message: 'No se encontró ningún registro con ese número de radicado.' };
    }
    
    console.log('Found matching radicado:', result._rawData[0]);
    
    // Función auxiliar para formatear el enlace
    function formatUrl(url) {
      if (!url) return 'No disponible';
      // Si la URL no comienza con http:// o https://, agregar https://
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return `https://${url}`;
      }
      return url;
    }

    return {
      found: true,
      data: {
        radicado: result._rawData[0] || 'No disponible',
        fecha: result._rawData[1] || 'No disponible',
        asunto: result._rawData[2] || 'No disponible',
        asignado: result._rawData[3] || 'No asignado',
        estado: result._rawData[4] || 'Sin estado',
        fechaEstimada: result._rawData[5] || 'No definida',
        respuesta: result._rawData[6] || 'Sin respuesta',
        enlace: formatUrl(result._rawData[7])
      }
    };
  } catch (error) {
    console.error('Error searching by radicado:', error);
    throw new Error('Error al buscar el radicado: ' + error.message);
  }
}

export async function searchByAsunto(keyword) {
  try {
    console.log('Searching for keyword in asunto:', keyword);
    const { rows } = await getSheetData();
    
    const results = rows.filter(row => {
      const asunto = row._rawData[2]; // Assuming asunto is in the third column
      console.log('Checking asunto:', asunto);
      return asunto?.toLowerCase().includes(keyword.toLowerCase());
    });
    
    console.log('Matching results found:', results.length);
    
    if (results.length === 0) {
      return { found: false, message: 'No se encontraron registros que coincidan con la búsqueda.' };
    }
    
    return {
      found: true,
      data: results.map(result => ({
        radicado: result._rawData[0] || 'No disponible',
        fecha: result._rawData[1] || 'No disponible',
        asunto: result._rawData[2] || 'No disponible',
        asignado: result._rawData[3] || 'No asignado',
        estado: result._rawData[4] || 'Sin estado',
        fechaEstimada: result._rawData[5] || 'No definida',
        respuesta: result._rawData[6] || 'Sin respuesta',
        enlace: formatUrl(result._rawData[7])
      }))
    };
  } catch (error) {
    console.error('Error searching by asunto:', error);
    throw new Error('Error al buscar por asunto: ' + error.message);
  }
}

// Función auxiliar para formatear el enlace
function formatUrl(url) {
  if (!url) return 'No disponible';
  // Si la URL no comienza con http:// o https://, agregar https://
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  return url;
}
