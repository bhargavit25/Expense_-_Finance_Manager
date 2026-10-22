const prisma = require('../config/db');
const { toNumber, calculatePercentage } = require('../utils/decimal');
const { getPeriodDateRange, getMonthDateRange } = require('../utils/dateUtils');

async function getDashboardSummary(userId, periodType = 'this_month', customStart, customEnd) {
  const { start, end } = getPeriodDateRange(periodType, customStart, customEnd);

  // 1. Current Period Aggregations
  const [periodIncomeAgg, periodExpenseAgg, transactionCount] = await Promise.all([
    prisma.transaction.aggregate({
      where: {
        userId,
        type: 'INCOME',
        date: { gte: start, lte: end },
      },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: {
        userId,
        type: 'EXPENSE',
        date: { gte: start, lte: end },
      },
      _sum: { amount: true },
    }),
    prisma.transaction.count({
      where: {
        userId,
        date: { gte: start, lte: end },
      },
    }),
  ]);

  const totalIncome = toNumber(periodIncomeAgg._sum.amount);
  const totalExpenses = toNumber(periodExpenseAgg._sum.amount);
  const netPeriodCashflow = Math.round((totalIncome - totalExpenses) * 100) / 100;
  const savings = netPeriodCashflow;
  const savingsRate = totalIncome > 0 ? Math.round((savings / totalIncome) * 10000) / 100 : 0;

  // 2. Lifetime Account Balance (Distinguished from Period Net Cashflow)
  const [lifetimeIncomeAgg, lifetimeExpenseAgg] = await Promise.all([
    prisma.transaction.aggregate({
      where: { userId, type: 'INCOME' },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { userId, type: 'EXPENSE' },
      _sum: { amount: true },
    }),
  ]);

  const lifetimeIncome = toNumber(lifetimeIncomeAgg._sum.amount);
  const lifetimeExpenses = toNumber(lifetimeExpenseAgg._sum.amount);
  const lifetimeBalance = Math.round((lifetimeIncome - lifetimeExpenses) * 100) / 100;

  // 3. Current Month Budgets & Utilization
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const budgets = await prisma.budget.findMany({
    where: { userId, month: currentMonth, year: currentYear },
    include: { category: true },
  });

  const totalBudgetAmount = budgets.reduce((sum, b) => sum + toNumber(b.amount), 0);
  const budgetUtilization = totalBudgetAmount > 0 ? calculatePercentage(totalExpenses, totalBudgetAmount) : 0;

  // 4. Budget Warnings (Categories >= 75%)
  const { start: monthStart, end: monthEnd } = getMonthDateRange(currentYear, currentMonth);
  const budgetWarnings = [];

  for (const b of budgets) {
    const expenseAgg = await prisma.transaction.aggregate({
      where: {
        userId,
        categoryId: b.categoryId,
        type: 'EXPENSE',
        date: { gte: monthStart, lte: monthEnd },
      },
      _sum: { amount: true },
    });

    const bSpent = toNumber(expenseAgg._sum.amount);
    const bTotal = toNumber(b.amount);
    const pct = calculatePercentage(bSpent, bTotal);

    if (pct >= 75) {
      budgetWarnings.push({
        categoryId: b.categoryId,
        categoryName: b.category.name,
        color: b.category.color,
        budgetAmount: bTotal,
        spentAmount: bSpent,
        usagePercentage: pct,
        isOverspent: pct > 100,
      });
    }
  }

  // 5. Recent 5 Transactions
  const recentTransactions = await prisma.transaction.findMany({
    where: { userId },
    take: 5,
    orderBy: { date: 'desc' },
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
  });

  return {
    period: {
      type: periodType,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    },
    summary: {
      totalIncome,
      totalExpenses,
      netPeriodCashflow,
      savings,
      savingsRate,
      lifetimeBalance,
      lifetimeIncome,
      lifetimeExpenses,
      budgetUtilization,
      transactionCount,
    },
    budgetWarnings,
    recentTransactions: recentTransactions.map((t) => ({
      ...t,
      amount: toNumber(t.amount),
    })),
  };
}

async function getIncomeVsExpenses(userId, monthsCount = 6) {
  const result = [];
  const now = new Date();

  for (let i = monthsCount - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    const { start, end } = getMonthDateRange(year, month);
    const monthLabel = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });

    const [incomeAgg, expenseAgg] = await Promise.all([
      prisma.transaction.aggregate({
        where: { userId, type: 'INCOME', date: { gte: start, lte: end } },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { userId, type: 'EXPENSE', date: { gte: start, lte: end } },
        _sum: { amount: true },
      }),
    ]);

    const income = toNumber(incomeAgg._sum.amount);
    const expenses = toNumber(expenseAgg._sum.amount);

    result.push({
      month: monthLabel,
      income,
      expenses,
      net: Math.round((income - expenses) * 100) / 100,
    });
  }

  return result;
}

async function getExpenseBreakdown(userId, periodType = 'this_month', customStart, customEnd) {
  const { start, end } = getPeriodDateRange(periodType, customStart, customEnd);

  const expenses = await prisma.transaction.findMany({
    where: {
      userId,
      type: 'EXPENSE',
      date: { gte: start, lte: end },
    },
    include: {
      category: true,
    },
  });

  const categoryMap = {};
  let totalExpenses = 0;

  for (const t of expenses) {
    const catName = t.category?.name || 'Uncategorized';
    const catColor = t.category?.color || '#6366F1';
    const amount = toNumber(t.amount);

    totalExpenses += amount;
    if (!categoryMap[catName]) {
      categoryMap[catName] = {
        name: catName,
        value: 0,
        color: catColor,
      };
    }
    categoryMap[catName].value += amount;
  }

  const breakdown = Object.values(categoryMap).map((item) => ({
    name: item.name,
    value: Math.round(item.value * 100) / 100,
    percentage: calculatePercentage(item.value, totalExpenses),
    color: item.color,
  }));

  // Sort by value descending
  breakdown.sort((a, b) => b.value - a.value);

  return {
    totalExpenses: Math.round(totalExpenses * 100) / 100,
    breakdown,
  };
}

async function getMonthlySpendingTrend(userId, monthsCount = 6) {
  const result = [];
  const now = new Date();

  for (let i = monthsCount - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    const { start, end } = getMonthDateRange(year, month);
    const monthLabel = d.toLocaleString('en-US', { month: 'short' });

    const expenseAgg = await prisma.transaction.aggregate({
      where: { userId, type: 'EXPENSE', date: { gte: start, lte: end } },
      _sum: { amount: true },
    });

    result.push({
      month: monthLabel,
      spending: toNumber(expenseAgg._sum.amount),
    });
  }

  return result;
}

async function getCategoryComparison(userId, periodType = 'this_month', customStart, customEnd) {
  const breakdownData = await getExpenseBreakdown(userId, periodType, customStart, customEnd);
  return breakdownData.breakdown;
}

async function getBudgetVsActual(userId, month, year) {
  const targetMonth = month ? parseInt(month, 10) : new Date().getMonth() + 1;
  const targetYear = year ? parseInt(year, 10) : new Date().getFullYear();

  const budgets = await prisma.budget.findMany({
    where: { userId, month: targetMonth, year: targetYear },
    include: { category: true },
  });

  const { start, end } = getMonthDateRange(targetYear, targetMonth);

  const comparison = await Promise.all(
    budgets.map(async (b) => {
      const expenseAgg = await prisma.transaction.aggregate({
        where: {
          userId,
          categoryId: b.categoryId,
          type: 'EXPENSE',
          date: { gte: start, lte: end },
        },
        _sum: { amount: true },
      });

      const budgetAmount = toNumber(b.amount);
      const actualAmount = toNumber(expenseAgg._sum.amount);

      return {
        category: b.category.name,
        color: b.category.color,
        budget: budgetAmount,
        actual: actualAmount,
        remaining: Math.round((budgetAmount - actualAmount) * 100) / 100,
        usagePercentage: calculatePercentage(actualAmount, budgetAmount),
      };
    })
  );

  return comparison;
}

async function getSavingsTrend(userId, monthsCount = 6) {
  const incomeVsExpense = await getIncomeVsExpenses(userId, monthsCount);
  return incomeVsExpense.map((item) => ({
    month: item.month,
    income: item.income,
    expenses: item.expenses,
    savings: item.net,
  }));
}

module.exports = {
  getDashboardSummary,
  getIncomeVsExpenses,
  getExpenseBreakdown,
  getMonthlySpendingTrend,
  getCategoryComparison,
  getBudgetVsActual,
  getSavingsTrend,
};
