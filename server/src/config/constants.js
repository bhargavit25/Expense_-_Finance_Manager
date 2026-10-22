const CONSTANTS = {
  TRANSACTION_TYPES: {
    INCOME: 'INCOME',
    EXPENSE: 'EXPENSE',
  },
  RECURRENCE_FREQUENCIES: {
    DAILY: 'DAILY',
    WEEKLY: 'WEEKLY',
    MONTHLY: 'MONTHLY',
    YEARLY: 'YEARLY',
  },
  NOTIFICATION_TYPES: {
    BUDGET_WARNING: 'BUDGET_WARNING',
    BUDGET_EXCEEDED: 'BUDGET_EXCEEDED',
    RECURRING_PROCESSED: 'RECURRING_PROCESSED',
    SYSTEM: 'SYSTEM',
  },
  BUDGET_THRESHOLDS: [
    { threshold: 75, label: '75%', warningLevel: 'warning' },
    { threshold: 90, label: '90%', warningLevel: 'critical' },
    { threshold: 100, label: '100%', warningLevel: 'exceeded' },
    { threshold: 101, label: '>100%', warningLevel: 'overspent' },
  ],
  PAYMENT_METHODS: [
    'Cash',
    'Credit Card',
    'Debit Card',
    'Bank Transfer',
    'UPI',
    'Check',
    'Other',
  ],
};

module.exports = CONSTANTS;
