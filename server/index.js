const express = require('express');
const cors = require('cors');
const { mkdir } = require('fs/promises');
const apiRoutes = require('./routes/api.js');
const errorHandler = require('./middleware/errorHandler.js');
const SERVER_CONFIG = require('./config/server.js');

// Load environment variables only in development
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const app = express();

// CORS middleware
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://*.koyeb.app', 'https://*.koyeb.com'] 
    : 'http://localhost:5173',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Parse JSON bodies
app.use(express.json());

// Add headers middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.NODE_ENV === 'production' 
    ? ['https://*.koyeb.app', 'https://*.koyeb.com'] 
    : 'http://localhost:5173');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

// Ensure uploads directory exists
mkdir(SERVER_CONFIG.UPLOADS_DIR, { recursive: true })
  .catch(err => {
    console.error('Error creating uploads directory:', err);
    process.exit(1);
  });

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Routes
app.use('/api', apiRoutes);

// Error handling
app.use(errorHandler);

let server;
try {
  const PORT = process.env.PORT || SERVER_CONFIG.PORT;
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