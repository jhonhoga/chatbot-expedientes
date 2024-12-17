import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const SERVER_CONFIG = {
  port: process.env.PORT || 10000,
  cors: {
    origin: ['https://chatbot-expedientes.onrender.com', 'http://localhost:5173'],
    methods: ['GET', 'POST'],
    credentials: true
  },
  uploadsDir: join(__dirname, '..', 'uploads'),
};