import { ListResourcesRequestSchema, ReadResourceRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import logger from '../utils/logger.js';

// Sample resources
const sampleResources = {
  'file://sample.txt': {
    name: 'Sample Text',
    mimeType: 'text/plain',
    content: 'This is a sample text file from the MCP server.'
  },
  'file://sample.json': {
    name: 'Sample JSON',
    mimeType: 'application/json',
    content: JSON.stringify({ message: 'This is a sample JSON file.' }, null, 2)
  }
};

// Register resource handlers
export function registerResourceHandlers(server: Server) {
  // List available resources
  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    logger.debug('Listing available resources');

    return {
      resources: Object.entries(sampleResources).map(([uri, resource]) => ({
        uri,
        name: resource.name,
        mimeType: resource.mimeType
      }))
    };
  });

  // Handle resource reads
  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const { uri } = request.params;
    logger.debug({ uri }, 'Resource read requested');

    const resource = sampleResources[uri as keyof typeof sampleResources];

    if (!resource) {
      throw new Error(`Resource not found: ${uri}`);
    }

    return {
      contents: [
        {
          uri,
          mimeType: resource.mimeType,
          text: resource.content
        }
      ]
    };
  });
}