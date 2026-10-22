const prisma = require('../config/db');
const { toDecimal, toNumber } = require('../utils/decimal');
const budgetService = require('./budget.service');

async function createTransaction(userId, data) {
  // Validate category
  const category = await prisma.category.findFirst({
    where: {
      id: data.categoryId,
      OR: [{ userId: null }, { userId }],
    },
  });

  if (!category) {
    const error = new Error('Selected category not found.');
    error.statusCode = 404;
    throw error;
  }

  const transaction = await prisma.transaction.create({
    data: {
      userId,
      title: data.title,
      amount: toDecimal(data.amount),
      type: data.type,
      categoryId: data.categoryId,
      date: new Date(data.date),
      paymentMethod: data.paymentMethod || 'Cash',
      notes: data.notes || null,
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
  });

  // Re-evaluate budget if it's an expense
  if (data.type === 'EXPENSE') {
    await budgetService.evaluateCategoryBudget(userId, data.categoryId, data.date);
  }

  return {
    ...transaction,
    amount: toNumber(transaction.amount),
  };
}

async function getTransactions(userId, query = {}) {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const where = {
    userId,
    ...(query.type && { type: query.type }),
    ...(query.categoryId && { categoryId: query.categoryId }),
    ...(query.search && {
      OR: [
        { title: { contains: query.search, mode: 'insensitive' } },
        { notes: { contains: query.search, mode: 'insensitive' } },
      ],
    }),
  };

  if (query.startDate || query.endDate) {
    where.date = {};
    if (query.startDate) {
      where.date.gte = new Date(query.startDate);
    }
    if (query.endDate) {
      const end = new Date(query.endDate);
      end.setHours(23, 59, 59, 999);
      where.date.lte = end;
    }
  }

  const sortBy = query.sortBy || 'date';
  const sortOrder = query.sortOrder || 'desc';

  const [transactions, totalCount] = await Promise.all([
    prisma.transaction.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
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
    }),
    prisma.transaction.count({ where }),
  ]);

  return {
    transactions: transactions.map((t) => ({
      ...t,
      amount: toNumber(t.amount),
    })),
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit) || 1,
    },
  };
}

async function getTransactionById(userId, transactionId) {
  const transaction = await prisma.transaction.findFirst({
    where: { id: transactionId, userId },
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

  if (!transaction) {
    const error = new Error('Transaction not found.');
    error.statusCode = 404;
    throw error;
  }

  return {
    ...transaction,
    amount: toNumber(transaction.amount),
  };
}

async function updateTransaction(userId, transactionId, data) {
  const existing = await prisma.transaction.findFirst({
    where: { id: transactionId, userId },
  });

  if (!existing) {
    const error = new Error('Transaction not found.');
    error.statusCode = 404;
    throw error;
  }

  const updateData = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.amount !== undefined) updateData.amount = toDecimal(data.amount);
  if (data.type !== undefined) updateData.type = data.type;
  if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
  if (data.date !== undefined) updateData.date = new Date(data.date);
  if (data.paymentMethod !== undefined) updateData.paymentMethod = data.paymentMethod;
  if (data.notes !== undefined) updateData.notes = data.notes;

  const updated = await prisma.transaction.update({
    where: { id: transactionId },
    data: updateData,
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

  // Re-evaluate budget for old and new category / month
  if (existing.type === 'EXPENSE') {
    await budgetService.evaluateCategoryBudget(userId, existing.categoryId, existing.date);
  }
  if (updated.type === 'EXPENSE') {
    await budgetService.evaluateCategoryBudget(userId, updated.categoryId, updated.date);
  }

  return {
    ...updated,
    amount: toNumber(updated.amount),
  };
}

async function deleteTransaction(userId, transactionId) {
  const existing = await prisma.transaction.findFirst({
    where: { id: transactionId, userId },
  });

  if (!existing) {
    const error = new Error('Transaction not found.');
    error.statusCode = 404;
    throw error;
  }

  await prisma.transaction.delete({
    where: { id: transactionId },
  });

  // Re-evaluate budget if expense
  if (existing.type === 'EXPENSE') {
    await budgetService.evaluateCategoryBudget(userId, existing.categoryId, existing.date);
  }

  return { message: 'Transaction deleted successfully.' };
}

async function exportTransactionsToCsv(userId, query = {}) {
  const where = {
    userId,
    ...(query.type && { type: query.type }),
    ...(query.categoryId && { categoryId: query.categoryId }),
  };

  if (query.startDate || query.endDate) {
    where.date = {};
    if (query.startDate) where.date.gte = new Date(query.startDate);
    if (query.endDate) {
      const end = new Date(query.endDate);
      end.setHours(23, 59, 59, 999);
      where.date.lte = end;
    }
  }

  const transactions = await prisma.transaction.findMany({
    where,
    orderBy: { date: 'desc' },
    include: {
      category: { select: { name: true } },
    },
  });

  const headers = ['ID', 'Date', 'Title', 'Type', 'Category', 'Amount', 'Payment Method', 'Notes'];
  const rows = transactions.map((t) => [
    t.id,
    new Date(t.date).toISOString().split('T')[0],
    `"${(t.title || '').replace(/"/g, '""')}"`,
    t.type,
    `"${(t.category?.name || 'Uncategorized').replace(/"/g, '""')}"`,
    toNumber(t.amount).toFixed(2),
    `"${(t.paymentMethod || '').replace(/"/g, '""')}"`,
    `"${(t.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  return csvContent;
}

module.exports = {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  exportTransactionsToCsv,
};
