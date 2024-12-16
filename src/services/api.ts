import { API_CONFIG } from '../config/constants';
import { APIError, handleAPIError } from '../utils/errorHandling';

const fetchWithTimeout = async (
  url: string,
  options: RequestInit & { timeout?: number } = {}
): Promise<Response> => {
  const { timeout = API_CONFIG.TIMEOUT } = options;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    console.log(`Fetching URL: ${url}`);
    console.log('Fetch options:', {
      method: options.method || 'GET',
      headers: options.headers,
      body: options.body ? 'Present' : 'None'
    });

    const response = await fetch(url, {
      ...options,
      mode: 'cors',
      signal: controller.signal,
    });

    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    console.error('Fetch error details:', {
      name: (error as Error).name,
      message: (error as Error).message,
      stack: (error as Error).stack
    });
    throw error;
  }
};

export const sendQuery = async (query: string): Promise<{ response: string }> => {
  try {
    const response = await fetchWithTimeout(`${API_CONFIG.BASE_URL}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ query }),
    });

    console.log('Query response status:', response.status);

    if (!response.ok) {
      const error = await response.json();
      console.error('Query error:', error);
      throw new APIError(
        error.error || 'Error al enviar la consulta',
        response.status,
        error.details
      );
    }

    return response.json();
  } catch (error) {
    console.error('Send query error:', error);
    throw handleAPIError(error);
  }
};