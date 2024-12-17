import { API_CONFIG } from '../config';

export class APIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'APIError';
  }
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit & { timeout?: number } = {}
): Promise<Response> {
  const { timeout = 8000, ...fetchOptions } = options;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export async function sendQuery(query: string): Promise<any> {
  try {
    console.log('Fetching URL:', `${API_CONFIG.baseURL}${API_CONFIG.endpoints.query}`);
    console.log('Fetch options:', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });

    const response = await fetchWithTimeout(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.query}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      console.log('Fetch error details:', response);
      throw new APIError('Error en la respuesta del servidor');
    }

    return await response.json();
  } catch (error) {
    console.log('Send query error:', error);
    if (error instanceof APIError) {
      throw error;
    }
    console.log('Error handling:', error);
    throw new APIError('No se pudo conectar al servidor. Por favor, verifica que el servidor esté ejecutándose.');
  }
}