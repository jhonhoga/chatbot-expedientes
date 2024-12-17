import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { SERVER_CONFIG } from './config/server.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || SERVER_CONFIG.port;

// CORS middleware
app.use(cors(SERVER_CONFIG.corsOptions));

// Body parser middleware
app.use(express.json());

// Serve static files from the React app
app.use(express.static(join(__dirname, '../dist')));

// Import and use routes
import('./routes/api.js').then(module => {
  app.use('/api', module.default);
}).catch(err => {
  console.error('Error loading routes:', err);
});

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`✨ Server running on port ${PORT}`);
});