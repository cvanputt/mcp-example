import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import { randomUUID } from 'node:crypto';
import config from '../utils/config.js';
import logger from '../utils/logger.js';
import { registerToolHandlers } from './tools.js';
import { registerResourceHandlers } from './resources.js';
import { registerPromptHandlers } from './prompts.js';
import type { Request, Response } from 'express';

// Create MCP Server
export function createMCPServer() {
  const server = new Server(
    {
      name: config.serverName,
      version: config.serverVersion,
    },
    {
      capabilities: {
        tools: {},
        resources: {},
        prompts: {},
      },
    }
  );

  // Register handlers
  registerToolHandlers(server);
  registerResourceHandlers(server);
  registerPromptHandlers(server);

  return server;
}

// Map to store transports by session ID
const transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};

// Handle POST requests for client-to-server communication
export async function handlePostRequest(req: Request, res: Response) {
  try {
    // Check for existing session ID
    const sessionId = req.headers['mcp-session-id'] as string | undefined;
    let transport: StreamableHTTPServerTransport;

    logger.info({ sessionId }, 'MCP POST request received');

    if (sessionId && transports[sessionId]) {
      // Reuse existing transport
      logger.debug({ sessionId }, 'Using existing transport for session');
      transport = transports[sessionId];
    } else if (!sessionId && isInitializeRequest(req.body)) {
      // New initialization request
      logger.debug('Processing initialization request');

      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (sid) => {
          // Store the transport by session ID
          logger.debug({ sessionId: sid }, 'Session initialized');
          transports[sid] = transport;
        }
      });

      // Clean up transport when closed
      transport.onclose = () => {
        const sid = transport.sessionId;
        if (sid) {
          logger.debug({ sessionId: sid }, 'Transport closed');
          delete transports[sid];
        }
      };

      // Create a new server instance
      const server = createMCPServer();

      // Connect to the MCP server
      await server.connect(transport);
    } else {
      // Invalid request
      logger.warn({ sessionId }, 'Invalid session ID or non-initialization request');
      res.status(400).json({
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'Bad Request: No valid session ID provided',
        },
        id: null,
      });
      return;
    }

    // Handle the request
    await transport.handleRequest(req, res, req.body);

  } catch (error) {
    logger.error({
      error: error instanceof Error ? { message: error.message, stack: error.stack } : String(error)
    }, 'Error handling POST request');

    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: error instanceof Error ? error.message : 'Internal server error'
        },
        id: req.body?.id || null
      });
    }
  }
}

// Reusable handler for GET and DELETE requests
export async function handleSessionRequest(req: Request, res: Response) {
  const method = req.method;
  const sessionId = req.headers['mcp-session-id'] as string | undefined;

  try {
    logger.info({ sessionId, method }, `MCP ${method} request received`);

    if (!sessionId || !transports[sessionId]) {
      logger.warn({ sessionId }, 'Invalid or missing session ID');
      res.status(400).send('Invalid or missing session ID');
      return;
    }

    const transport = transports[sessionId];
    await transport.handleRequest(req, res);

  } catch (error) {
    logger.error({
      error: error instanceof Error ? { message: error.message, stack: error.stack } : String(error)
    }, `Error handling ${method} request`);

    if (!res.headersSent) {
      res.status(500).send('Internal server error');
    }
  }
}

// Main request handler that routes to the appropriate method handler
export async function handleMCPRequest(req: Request, res: Response) {
  const method = req.method;

  switch (method) {
    case 'POST':
      await handlePostRequest(req, res);
      break;
    case 'GET':
    case 'DELETE':
      await handleSessionRequest(req, res);
      break;
    default:
      logger.warn({ method }, 'Unsupported HTTP method');
      res.status(405).send('Method Not Allowed');
  }
}