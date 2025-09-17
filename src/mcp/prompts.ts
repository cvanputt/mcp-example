import { GetPromptRequestSchema, ListPromptsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import logger from '../utils/logger.js';

// Sample prompts
const samplePrompts = {
  'summarize': {
    description: 'Summarize the provided text',
    templateFn: (args: { text: string }) => `Please summarize the following text concisely:\n\n${args.text}`
  },
  'analyze': {
    description: 'Analyze the provided text',
    templateFn: (args: { text: string }) => `Please analyze the following text and provide key insights:\n\n${args.text}`
  }
};

// Register prompt handlers
export function registerPromptHandlers(server: Server) {
  // List available prompts
  server.setRequestHandler(ListPromptsRequestSchema, async () => {
    logger.debug('Listing available prompts');

    return {
      prompts: Object.entries(samplePrompts).map(([name, prompt]) => ({
        name,
        description: prompt.description
      }))
    };
  });

  // Handle prompt requests
  server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    logger.debug({ name, args }, 'Prompt requested');

    const prompt = samplePrompts[name as keyof typeof samplePrompts];

    if (!prompt) {
      throw new Error(`Prompt not found: ${name}`);
    }

    // Generate prompt text based on arguments
    const promptText = prompt.templateFn(args as { text: string });

    return {
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: promptText
          }
        }
      ]
    };
  });
}