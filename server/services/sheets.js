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
  
  // Log first row as sample
  if (rows.length > 0) {
    console.log('Sample row data:', {
      radicado: rows[0].get('Radicado'),
      fecha: rows[0].get('Fecha'),
      asunto: rows[0].get('Asunto'),
      estado: rows[0].get('Estado')
    });
  }
  
  return rows;
}

export async function searchByRadicado(radicado) {
  try {
    console.log('Searching by radicado:', radicado);
    const rows = await getSheetData();
    
    const result = rows.find(row => {
      const rowRadicado = row.get('Radicado');
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

    console.log('Found result for radicado:', result.get('Radicado'));
    return {
      found: true,
      data: {
        radicado: result.get('Radicado') || 'No disponible',
        fecha: result.get('Fecha') || 'No disponible',
        asunto: result.get('Asunto') || 'No disponible',
        asignado: result.get('Asignado') || 'No asignado',
        estado: result.get('Estado') || 'Sin estado',
        fechaEstimada: result.get('FechaEstimada') || 'No definida',
        respuesta: result.get('Respuesta') || 'Sin respuesta',
        enlace: formatUrl(result.get('URL'))
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
      const asunto = row.get('Asunto');
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
      data: results.map(row => ({
        radicado: row.get('Radicado') || 'No disponible',
        fecha: row.get('Fecha') || 'No disponible',
        asunto: row.get('Asunto') || 'No disponible',
        asignado: row.get('Asignado') || 'No asignado',
        estado: row.get('Estado') || 'Sin estado',
        fechaEstimada: row.get('FechaEstimada') || 'No definida',
        respuesta: row.get('Respuesta') || 'Sin respuesta',
        enlace: formatUrl(row.get('URL'))
      }))
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
