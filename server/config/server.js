import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const SERVER_CONFIG = {
  port: process.env.PORT || 3000,
  corsOptions: {
    origin: process.env.NODE_ENV === 'production'
      ? ['https://chatbot-expedientes.onrender.com']
      : ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
  },
  uploadsDir: join(__dirname, '..', 'uploads'),
};