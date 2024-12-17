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
  await sheet.loadCells();
  const rows = await sheet.getRows();
  return rows;
}

export async function searchByRadicado(radicado) {
  try {
    const rows = await getSheetData();
    const results = rows.filter(row => {
      const rowRadicado = row.get('Radicado');
      return rowRadicado && rowRadicado.toString().includes(radicado);
    });

    return results.map(row => ({
      radicado: row.get('Radicado'),
      asunto: row.get('Asunto'),
      url: formatUrl(row.get('URL')),
      fecha: row.get('Fecha'),
      estado: row.get('Estado')
    }));
  } catch (error) {
    console.error('Error searching by radicado:', error);
    throw error;
  }
}

export async function searchByAsunto(keyword) {
  try {
    const rows = await getSheetData();
    const results = rows.filter(row => {
      const asunto = row.get('Asunto');
      return asunto && asunto.toLowerCase().includes(keyword.toLowerCase());
    });

    return results.map(row => ({
      radicado: row.get('Radicado'),
      asunto: row.get('Asunto'),
      url: formatUrl(row.get('URL')),
      fecha: row.get('Fecha'),
      estado: row.get('Estado')
    }));
  } catch (error) {
    console.error('Error searching by asunto:', error);
    throw error;
  }
}

function formatUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `https://drive.google.com/file/d/${url}/view`;
}
