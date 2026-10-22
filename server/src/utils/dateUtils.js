/**
 * Date utility helpers for financial periods and recurring rules
 */

function getMonthDateRange(year, month) {
  // month is 1-12
  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
  return { start, end };
}

function getPeriodDateRange(periodType, customStart, customEnd) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed

  let start;
  let end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  switch (periodType) {
    case 'this_month':
      start = new Date(currentYear, currentMonth, 1, 0, 0, 0, 0);
      end = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);
      break;

    case 'last_month':
      start = new Date(currentYear, currentMonth - 1, 1, 0, 0, 0, 0);
      end = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);
      break;

    case 'last_3_months':
      start = new Date(currentYear, currentMonth - 2, 1, 0, 0, 0, 0);
      break;

    case 'this_year':
      start = new Date(currentYear, 0, 1, 0, 0, 0, 0);
      end = new Date(currentYear, 11, 31, 23, 59, 59, 999);
      break;

    case 'custom':
      start = customStart ? new Date(customStart) : new Date(currentYear, currentMonth, 1);
      end = customEnd ? new Date(customEnd) : new Date();
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;

    default: // default to this_month
      start = new Date(currentYear, currentMonth, 1, 0, 0, 0, 0);
      end = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);
  }

  return { start, end };
}

function calculateNextExecutionDate(currentExecutionDate, frequency) {
  const nextDate = new Date(currentExecutionDate);

  switch (frequency) {
    case 'DAILY':
      nextDate.setDate(nextDate.getDate() + 1);
      break;

    case 'WEEKLY':
      nextDate.setDate(nextDate.getDate() + 7);
      break;

    case 'MONTHLY':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;

    case 'YEARLY':
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;

    default:
      nextDate.setMonth(nextDate.getMonth() + 1);
  }

  return nextDate;
}

module.exports = {
  getMonthDateRange,
  getPeriodDateRange,
  calculateNextExecutionDate,
};
