import express from 'express';
import cors from 'cors';
import { handleMCPRequest } from './mcp/server.js';
import config from './utils/config.js';
import logger from './utils/logger.js';

// Create Express app
export function createApp() {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(cors({
    origin: config.cors.origin,
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Mcp-Session-Id', 'Mcp-Protocol-Version', 'Accept', 'Last-Event-Id'],
    exposedHeaders: ['Mcp-Session-Id', 'Mcp-Protocol-Version'],
    credentials: true
  }));

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.status(200).json({
      status: 'ok',
      service: config.serverName,
      version: config.serverVersion,
      timestamp: new Date().toISOString(),
    });
  });

  // MCP endpoints for streamable HTTP transport
  // Handle POST requests (JSON-RPC messages)
  app.post('/mcp', (req, res) => {
    logger.info({ ip: req.ip, method: 'POST' }, 'MCP POST request received');
    handleMCPRequest(req, res);
  });

  // Handle GET requests (SSE streams)
  app.get('/mcp', (req, res) => {
    logger.info({ ip: req.ip, method: 'GET' }, 'MCP GET connection requested');
    handleMCPRequest(req, res);
  });

  // Handle DELETE requests (session termination)
  app.delete('/mcp', (req, res) => {
    logger.info({ ip: req.ip, method: 'DELETE' }, 'MCP session termination requested');
    handleMCPRequest(req, res);
  });

  // Handle OPTIONS requests (preflight)
  app.options('/mcp', (req, res) => {
    logger.debug({ ip: req.ip }, 'MCP OPTIONS request (preflight)');
    res.status(204).end();
  });

  // Error handling middleware
  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    logger.error({ err }, 'Unhandled error');
    res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'production' ? undefined : err.message,
    });
  });

  return app;
}