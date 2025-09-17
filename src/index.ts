import { createApp } from './app.js';
import config from './utils/config.js';
import logger from './utils/logger.js';

async function main() {
  try {
    const app = createApp();

    // Start the server
    const server = app.listen(config.port, () => {
      logger.info({
        port: config.port,
        env: config.nodeEnv,
        service: config.serverName,
        version: config.serverVersion,
      }, 'Server started');
    });

    // Handle graceful shutdown
    const signals = ['SIGINT', 'SIGTERM'] as const;
    signals.forEach((signal) => {
      process.on(signal, () => {
        logger.info(`${signal} received, shutting down...`);
        server.close(() => {
          logger.info('Server closed');
          process.exit(0);
        });

        // Force close after 10 seconds if graceful shutdown fails
        setTimeout(() => {
          logger.error('Forcing server shutdown after timeout');
          process.exit(1);
        }, 10000);
      });
    });
  } catch (error) {
    logger.fatal({ error }, 'Fatal error during startup');
    process.exit(1);
  }
}

main().catch((error) => {
  logger.fatal({ error }, 'Unhandled error in main');
  process.exit(1);
});