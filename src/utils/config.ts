import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env file
dotenv.config({ path: resolve(process.cwd(), '.env') });

const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  serverName: process.env.SERVER_NAME || 'mcp-server',
  serverVersion: process.env.SERVER_VERSION || '1.0.0',
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
};

export default config;