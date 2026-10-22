const prisma = require('../config/db');
const { toDecimal, toNumber } = require('../utils/decimal');
const { calculateNextExecutionDate } = require('../utils/dateUtils');
const budgetService = require('./budget.service');
const logger = require('../utils/logger');

async function getRecurringRules(userId) {
  const rules = await prisma.recurringTransaction.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          color: true,
          icon: true,
        },
      },
      executions: {
        take: 5,
        orderBy: { executedAt: 'desc' },
      },
    },
  });

  return rules.map((r) => ({
    ...r,
    amount: toNumber(r.amount),
  }));
}

async function createRecurringRule(userId, data) {
  const startDate = new Date(data.startDate);
  const nextExecutionDate = new Date(startDate);

  const rule = await prisma.recurringTransaction.create({
    data: {
      userId,
      title: data.title,
      amount: toDecimal(data.amount),
      type: data.type,
      categoryId: data.categoryId,
      paymentMethod: data.paymentMethod || 'Bank Transfer',
      startDate,
      endDate: data.endDate ? new Date(data.endDate) : null,
      frequency: data.frequency,
      nextExecutionDate,
      isActive: true,
    },
    include: {
      category: true,
    },
  });

  return {
    ...rule,
    amount: toNumber(rule.amount),
  };
}

async function updateRecurringRule(userId, ruleId, data) {
  const existing = await prisma.recurringTransaction.findFirst({
    where: { id: ruleId, userId },
  });

  if (!existing) {
    const error = new Error('Recurring rule not found.');
    error.statusCode = 404;
    throw error;
  }

  const updateData = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.amount !== undefined) updateData.amount = toDecimal(data.amount);
  if (data.type !== undefined) updateData.type = data.type;
  if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
  if (data.paymentMethod !== undefined) updateData.paymentMethod = data.paymentMethod;
  if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate);
  if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null;
  if (data.frequency !== undefined) updateData.frequency = data.frequency;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;

  const updated = await prisma.recurringTransaction.update({
    where: { id: ruleId },
    data: updateData,
    include: { category: true },
  });

  return {
    ...updated,
    amount: toNumber(updated.amount),
  };
}

async function deleteRecurringRule(userId, ruleId) {
  const existing = await prisma.recurringTransaction.findFirst({
    where: { id: ruleId, userId },
  });

  if (!existing) {
    const error = new Error('Recurring rule not found.');
    error.statusCode = 404;
    throw error;
  }

  await prisma.recurringTransaction.delete({
    where: { id: ruleId },
  });

  return { message: 'Recurring transaction rule deleted.' };
}

async function toggleRuleStatus(userId, ruleId, isActive) {
  const existing = await prisma.recurringTransaction.findFirst({
    where: { id: ruleId, userId },
  });

  if (!existing) {
    const error = new Error('Recurring rule not found.');
    error.statusCode = 404;
    throw error;
  }

  const updated = await prisma.recurringTransaction.update({
    where: { id: ruleId },
    data: { isActive },
    include: { category: true },
  });

  return {
    ...updated,
    amount: toNumber(updated.amount),
  };
}

/**
 * Idempotent processor for due recurring transactions
 * Designed for continuous cron or scheduled job execution on Render/serverless
 */
async function processDueRecurringTransactions() {
  const now = new Date();
  logger.info(`Running recurring transactions processor at ${now.toISOString()}`);

  // Fetch all active rules where nextExecutionDate is due (<= now)
  const dueRules = await prisma.recurringTransaction.findMany({
    where: {
      isActive: true,
      nextExecutionDate: { lte: now },
      OR: [
        { endDate: null },
        { endDate: { gte: now } },
      ],
    },
    include: {
      category: true,
    },
  });

  let processedCount = 0;
  let skippedCount = 0;
  const errors = [];

  for (const rule of dueRules) {
    const scheduledDateStr = rule.nextExecutionDate.toISOString().split('T')[0];
    const idempotencyKey = `${rule.id}_${scheduledDateStr}`;

    try {
      // Execute atomically
      await prisma.$transaction(async (tx) => {
        // 1. Check idempotency
        const alreadyExecuted = await tx.recurringTransactionExecution.findUnique({
          where: { idempotencyKey },
        });

        if (alreadyExecuted) {
          skippedCount++;
          return;
        }

        // 2. Create the real transaction
        const newTransaction = await tx.transaction.create({
          data: {
            userId: rule.userId,
            title: rule.title,
            amount: rule.amount,
            type: rule.type,
            categoryId: rule.categoryId,
            date: rule.nextExecutionDate,
            paymentMethod: rule.paymentMethod,
            notes: `Auto-generated from recurring rule: ${rule.title}`,
          },
        });

        // 3. Record execution ledger
        await tx.recurringTransactionExecution.create({
          data: {
            recurringTransactionId: rule.id,
            transactionId: newTransaction.id,
            scheduledDate: rule.nextExecutionDate,
            idempotencyKey,
            status: 'SUCCESS',
          },
        });

        // 4. Calculate next execution date
        const nextDate = calculateNextExecutionDate(rule.nextExecutionDate, rule.frequency);
        const shouldDeactivate = rule.endDate && nextDate > rule.endDate;

        // 5. Update rule
        await tx.recurringTransaction.update({
          where: { id: rule.id },
          data: {
            nextExecutionDate: nextDate,
            lastExecutedAt: now,
            isActive: !shouldDeactivate,
          },
        });

        processedCount++;
      });

      // 6. Trigger budget recalculation after transaction
      if (rule.type === 'EXPENSE') {
        await budgetService.evaluateCategoryBudget(rule.userId, rule.categoryId, rule.nextExecutionDate);
      }
    } catch (err) {
      logger.error(`Error processing recurring rule ${rule.id}`, { error: err.message });
      errors.push({ ruleId: rule.id, error: err.message });

      // Record failed execution attempt if needed
      try {
        await prisma.recurringTransactionExecution.create({
          data: {
            recurringTransactionId: rule.id,
            scheduledDate: rule.nextExecutionDate,
            idempotencyKey,
            status: 'FAILED',
            errorMessage: err.message,
          },
        });
      } catch (_) {}
    }
  }

  logger.info(`Recurring processor completed. Processed: ${processedCount}, Skipped: ${skippedCount}, Errors: ${errors.length}`);

  return {
    processedCount,
    skippedCount,
    errors,
  };
}

module.exports = {
  getRecurringRules,
  createRecurringRule,
  updateRecurringRule,
  deleteRecurringRule,
  toggleRuleStatus,
  processDueRecurringTransactions,
};
