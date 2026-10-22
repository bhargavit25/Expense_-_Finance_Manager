const prisma = require('../config/db');

async function getCategories(userId) {
  const categories = await prisma.category.findMany({
    where: {
      OR: [
        { userId: null }, // System defaults
        { userId }, // User custom
      ],
    },
    orderBy: [
      { isDefault: 'desc' },
      { name: 'asc' },
    ],
  });

  return categories;
}

async function createCategory(userId, { name, type, color, icon }) {
  // Check if name already exists for this user or in default categories with same type
  const existing = await prisma.category.findFirst({
    where: {
      name: { equals: name, mode: 'insensitive' },
      type,
      OR: [
        { userId: null },
        { userId },
      ],
    },
  });

  if (existing) {
    const error = new Error(`A category with the name "${name}" already exists for ${type.toLowerCase()}s.`);
    error.statusCode = 409;
    throw error;
  }

  const category = await prisma.category.create({
    data: {
      name,
      type,
      color: color || '#6366F1',
      icon: icon || 'Folder',
      isDefault: false,
      userId,
    },
  });

  return category;
}

async function updateCategory(userId, categoryId, data) {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    const error = new Error('Category not found.');
    error.statusCode = 404;
    throw error;
  }

  if (category.isDefault || !category.userId) {
    const error = new Error('System default categories cannot be modified.');
    error.statusCode = 403;
    throw error;
  }

  if (category.userId !== userId) {
    const error = new Error('Unauthorized to modify this category.');
    error.statusCode = 403;
    throw error;
  }

  const updated = await prisma.category.update({
    where: { id: categoryId },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.color && { color: data.color }),
      ...(data.icon && { icon: data.icon }),
    },
  });

  return updated;
}

async function deleteCategory(userId, categoryId, reassignToCategoryId) {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: {
      _count: {
        select: {
          transactions: true,
          budgets: true,
          recurringTransactions: true,
        },
      },
    },
  });

  if (!category) {
    const error = new Error('Category not found.');
    error.statusCode = 404;
    throw error;
  }

  if (category.isDefault || !category.userId) {
    const error = new Error('System default categories cannot be deleted.');
    error.statusCode = 403;
    throw error;
  }

  if (category.userId !== userId) {
    const error = new Error('Unauthorized to delete this category.');
    error.statusCode = 403;
    throw error;
  }

  const txCount = category._count.transactions;
  const budgetCount = category._count.budgets;
  const recurringCount = category._count.recurringTransactions;
  const totalDependent = txCount + budgetCount + recurringCount;

  if (totalDependent > 0) {
    if (!reassignToCategoryId) {
      const error = new Error(
        `Category cannot be deleted directly because it has ${txCount} transaction(s), ${budgetCount} budget(s), and ${recurringCount} recurring rule(s). Please specify a replacement category to safely reassign historical records.`
      );
      error.statusCode = 400;
      error.code = 'CATEGORY_HAS_DEPENDENCIES';
      error.details = { txCount, budgetCount, recurringCount };
      throw error;
    }

    // Verify replacement category
    const replacement = await prisma.category.findFirst({
      where: {
        id: reassignToCategoryId,
        type: category.type,
        OR: [{ userId: null }, { userId }],
      },
    });

    if (!replacement) {
      const error = new Error('Invalid replacement category specified.');
      error.statusCode = 400;
      throw error;
    }

    if (replacement.id === categoryId) {
      const error = new Error('Cannot reassign to the category being deleted.');
      error.statusCode = 400;
      throw error;
    }

    // Execute reassignment and deletion in a transaction
    await prisma.$transaction(async (tx) => {
      // Reassign transactions
      await tx.transaction.updateMany({
        where: { categoryId },
        data: { categoryId: replacement.id },
      });

      // Reassign recurring rules
      await tx.recurringTransaction.updateMany({
        where: { categoryId },
        data: { categoryId: replacement.id },
      });

      // Delete existing budgets for this category to avoid unique constraint conflicts
      await tx.budget.deleteMany({
        where: { categoryId },
      });

      // Delete the category
      await tx.category.delete({
        where: { id: categoryId },
      });
    });

    return {
      message: `Category successfully deleted and ${txCount} transaction(s) were reassigned to "${replacement.name}".`,
    };
  }

  // Safe to delete directly
  await prisma.category.delete({
    where: { id: categoryId },
  });

  return { message: 'Category deleted successfully.' };
}

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
