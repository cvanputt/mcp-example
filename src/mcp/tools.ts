import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import logger from '../utils/logger.js';

// Example tool schema
const exampleToolSchema = {
  type: 'object',
  properties: {
    input: { type: 'string' }
  },
  required: ['input']
};

// Register tool handlers
export function registerToolHandlers(server: Server) {
  // List available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    logger.debug('Listing available tools');
    return {
      tools: [
        {
          name: 'echo',
          description: 'Echoes back the input',
          inputSchema: exampleToolSchema
        }
      ]
    };
  });

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    logger.debug({ name, args }, 'Tool call received');

    switch (name) {
      case 'echo':
        return {
          content: [
            {
              type: 'text',
              text: `Echo: ${(args as { input: string }).input}`
            }
          ]
        };
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  });
}