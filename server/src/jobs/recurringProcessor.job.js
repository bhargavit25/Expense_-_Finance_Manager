const cron = require('node-cron');
const config = require('../config/env');
const recurringService = require('../services/recurring.service');
const logger = require('../utils/logger');

let cronTask = null;

function startRecurringJob() {
  if (cronTask) {
    logger.warn('Recurring transactions cron job is already running.');
    return;
  }

  logger.info(`Initializing recurring transactions cron job with schedule: "${config.cronSchedule}"`);

  // Validate cron expression
  if (!cron.validate(config.cronSchedule)) {
    logger.error(`Invalid cron schedule expression: "${config.cronSchedule}". Using default daily schedule "0 0 * * *".`);
  }

  const schedule = cron.validate(config.cronSchedule) ? config.cronSchedule : '0 0 * * *';

  cronTask = cron.schedule(schedule, async () => {
    try {
      logger.info('Starting automated execution of due recurring transactions...');
      const result = await recurringService.processDueRecurringTransactions();
      logger.info('Scheduled recurring transactions execution finished.', result);
    } catch (err) {
      logger.error('Error during scheduled recurring transactions execution:', { error: err.message });
    }
  });

  logger.info('Recurring transactions cron job started successfully.');
}

function stopRecurringJob() {
  if (cronTask) {
    cronTask.stop();
    cronTask = null;
    logger.info('Recurring transactions cron job stopped.');
  }
}

module.exports = {
  startRecurringJob,
  stopRecurringJob,
};
