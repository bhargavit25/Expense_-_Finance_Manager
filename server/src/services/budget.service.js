const prisma = require('../config/db');
const { toNumber, toDecimal, calculatePercentage } = require('../utils/decimal');
const { getMonthDateRange } = require('../utils/dateUtils');
const notificationService = require('./notification.service');

async function getBudgets(userId, month, year) {
  const currentMonth = month ? parseInt(month, 10) : new Date().getMonth() + 1;
  const currentYear = year ? parseInt(year, 10) : new Date().getFullYear();

  // Get all budgets for user in this month/year
  const budgets = await prisma.budget.findMany({
    where: {
      userId,
      month: currentMonth,
      year: currentYear,
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          color: true,
          icon: true,
          type: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  const { start, end } = getMonthDateRange(currentYear, currentMonth);

  // For each budget, compute actual spent amount
  const budgetsWithCalculations = await Promise.all(
    budgets.map(async (b) => {
      const expenseAggregation = await prisma.transaction.aggregate({
        where: {
          userId,
          categoryId: b.categoryId,
          type: 'EXPENSE',
          date: {
            gte: start,
            lte: end,
          },
        },
        _sum: {
          amount: true,
        },
      });

      const budgetAmount = toNumber(b.amount);
      const spentAmount = toNumber(expenseAggregation._sum.amount);
      const remainingAmount = Math.round((budgetAmount - spentAmount) * 100) / 100;
      const usagePercentage = calculatePercentage(spentAmount, budgetAmount);

      let status = 'normal';
      if (usagePercentage >= 100) {
        status = 'overspent';
      } else if (usagePercentage >= 90) {
        status = 'critical';
      } else if (usagePercentage >= 75) {
        status = 'warning';
      }

      return {
        id: b.id,
        categoryId: b.categoryId,
        category: b.category,
        month: b.month,
        year: b.year,
        budgetAmount,
        spentAmount,
        remainingAmount,
        usagePercentage,
        status,
        createdAt: b.createdAt,
      };
    })
  );

  return {
    month: currentMonth,
    year: currentYear,
    budgets: budgetsWithCalculations,
  };
}

async function setBudget(userId, { categoryId, month, year, amount }) {
  const numAmount = toNumber(amount);
  if (numAmount <= 0) {
    const error = new Error('Budget amount must be greater than zero.');
    error.statusCode = 400;
    throw error;
  }

  // Ensure category exists
  const category = await prisma.category.findFirst({
    where: {
      id: categoryId,
      type: 'EXPENSE',
      OR: [{ userId: null }, { userId }],
    },
  });

  if (!category) {
    const error = new Error('Expense category not found.');
    error.statusCode = 404;
    throw error;
  }

  // Upsert budget
  const budget = await prisma.budget.upsert({
    where: {
      userId_categoryId_month_year: {
        userId,
        categoryId,
        month,
        year,
      },
    },
    update: {
      amount: toDecimal(numAmount),
    },
    create: {
      userId,
      categoryId,
      month,
      year,
      amount: toDecimal(numAmount),
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          color: true,
          icon: true,
        },
      },
    },
  });

  // Evaluate alerts immediately
  await evaluateCategoryBudget(userId, categoryId, new Date(year, month - 1, 15));

  return budget;
}

async function updateBudget(userId, budgetId, amount) {
  const numAmount = toNumber(amount);
  if (numAmount <= 0) {
    const error = new Error('Budget amount must be greater than zero.');
    error.statusCode = 400;
    throw error;
  }

  const existing = await prisma.budget.findFirst({
    where: { id: budgetId, userId },
  });

  if (!existing) {
    const error = new Error('Budget not found.');
    error.statusCode = 404;
    throw error;
  }

  const updated = await prisma.budget.update({
    where: { id: budgetId },
    data: {
      amount: toDecimal(numAmount),
    },
    include: {
      category: true,
    },
  });

  // Evaluate alerts
  await evaluateCategoryBudget(userId, updated.categoryId, new Date(updated.year, updated.month - 1, 15));

  return updated;
}

async function deleteBudget(userId, budgetId) {
  const existing = await prisma.budget.findFirst({
    where: { id: budgetId, userId },
  });

  if (!existing) {
    const error = new Error('Budget not found.');
    error.statusCode = 404;
    throw error;
  }

  await prisma.budget.delete({
    where: { id: budgetId },
  });

  return { message: 'Budget deleted successfully.' };
}

/**
 * Evaluates category budget against current actual spending and creates deduplicated alerts
 */
async function evaluateCategoryBudget(userId, categoryId, targetDate) {
  try {
    const dateObj = new Date(targetDate);
    const month = dateObj.getMonth() + 1;
    const year = dateObj.getFullYear();

    const budget = await prisma.budget.findUnique({
      where: {
        userId_categoryId_month_year: {
          userId,
          categoryId,
          month,
          year,
        },
      },
      include: {
        category: true,
      },
    });

    if (!budget) return; // No budget defined for this category/month

    const { start, end } = getMonthDateRange(year, month);

    const expenseAggregation = await prisma.transaction.aggregate({
      where: {
        userId,
        categoryId,
        type: 'EXPENSE',
        date: {
          gte: start,
          lte: end,
        },
      },
      _sum: {
        amount: true,
      },
    });

    const budgetAmount = toNumber(budget.amount);
    const spentAmount = toNumber(expenseAggregation._sum.amount);
    const percentage = calculatePercentage(spentAmount, budgetAmount);

    const categoryName = budget.category.name;

    // Check thresholds: 75%, 90%, 100%, >100% (101)
    if (percentage > 100) {
      await notificationService.createBudgetAlert({
        userId,
        categoryId,
        categoryName,
        month,
        year,
        threshold: 101,
        spentAmount,
        budgetAmount,
      });
    } else if (percentage === 100) {
      await notificationService.createBudgetAlert({
        userId,
        categoryId,
        categoryName,
        month,
        year,
        threshold: 100,
        spentAmount,
        budgetAmount,
      });
    } else if (percentage >= 90) {
      await notificationService.createBudgetAlert({
        userId,
        categoryId,
        categoryName,
        month,
        year,
        threshold: 90,
        spentAmount,
        budgetAmount,
      });
    } else if (percentage >= 75) {
      await notificationService.createBudgetAlert({
        userId,
        categoryId,
        categoryName,
        month,
        year,
        threshold: 75,
        spentAmount,
        budgetAmount,
      });
    }
  } catch (err) {
    // Non-blocking error handling for alert evaluation
    console.error('Error in evaluateCategoryBudget:', err);
  }
}

module.exports = {
  getBudgets,
  setBudget,
  updateBudget,
  deleteBudget,
  evaluateCategoryBudget,
};
