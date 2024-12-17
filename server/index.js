import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import apiRoutes from './routes/api.js';
import errorHandler from './middleware/errorHandler.js';
import SERVER_CONFIG from './config/server.js';

// Load environment variables only in development
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || SERVER_CONFIG.PORT;

// CORS middleware
app.use(cors(SERVER_CONFIG.corsOptions));

// Parse JSON bodies
app.use(express.json());

// Serve static files from the React app
app.use(express.static(join(__dirname, '../dist')));

// Use API routes
app.use('/api', apiRoutes);

// Error handling
app.use(errorHandler);

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../dist/index.html'));
});

let server;
try {
  server = app.listen(PORT, () => {
    console.log(`✨ Server running on http://localhost:${PORT}`);
  });
} catch (error) {
  console.error('Failed to start server:', error);
  process.exit(1);
}

// Graceful shutdown
const shutdown = () => {
  console.log('\nShutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
  
  // Force close after 10s
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);