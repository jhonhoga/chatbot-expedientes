const path = require('path');
const url = require('url');

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const SERVER_CONFIG = {
  port: process.env.PORT || 3000,
  corsOptions: {
    origin: process.env.NODE_ENV === 'production'
      ? ['https://chatbot-jhonhoga.koyeb.app']
      : ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
  },
  uploadsDir: path.join(__dirname, '..', 'uploads'),
};

module.exports = SERVER_CONFIG;