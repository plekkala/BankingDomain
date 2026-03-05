/**
 * Express application setup.
 */

'use strict';

const express              = require('express');
const { authenticate }     = require('./middleware/auth');
const participantRoutes    = require('./routes/participants');

const app = express();

app.use(express.json());

// Health check — unauthenticated
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// All subsequent routes require authentication
app.use(authenticate);

app.use('/participants', participantRoutes);

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
