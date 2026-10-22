const app = require('./src/app');
const config = require('./src/config/env');
const prisma = require('./src/config/db');
const logger = require('./src/utils/logger');
const { startRecurringJob, stopRecurringJob } = require('./src/jobs/recurringProcessor.job');

const PORT = config.port;

const server = app.listen(PORT, async () => {
  logger.info(`🚀 Expense & Finance Manager Server running on port ${PORT} [${config.nodeEnv}]`);
  logger.info(`📡 Health check available at: http://localhost:${PORT}/api/health`);

  // Start cron scheduler for recurring transactions
  startRecurringJob();
});

// Graceful shutdown handling
async function shutdown(signal) {
  logger.info(`Received ${signal}. Gracefully shutting down server...`);
  stopRecurringJob();

  server.close(async () => {
    logger.info('HTTP server closed.');
    try {
      await prisma.$disconnect();
      logger.info('Database disconnected.');
      process.exit(0);
    } catch (err) {
      logger.error('Error during database disconnect:', { error: err.message });
      process.exit(1);
    }
  });

  // Force shutdown after 10s timeout
  setTimeout(() => {
    logger.error('Forced shutdown due to timeout.');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

module.exports = server;
