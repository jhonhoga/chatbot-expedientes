// API configuration
const isDevelopment = import.meta.env.DEV;

export const API_CONFIG = {
  baseURL: isDevelopment 
    ? 'http://localhost:10000/api'
    : 'https://chatbot-expedientes.onrender.com/api',
  endpoints: {
    query: '/query',
    search: '/search'
  }
};
