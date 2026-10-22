const prisma = require('../config/db');
const logger = require('../utils/logger');

async function getNotifications(userId, limit = 50) {
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
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

  const unreadCount = await prisma.notification.count({
    where: {
      userId,
      isRead: false,
    },
  });

  return { notifications, unreadCount };
}

async function markAsRead(userId, notificationId) {
  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, userId },
  });

  if (!notification) {
    const error = new Error('Notification not found.');
    error.statusCode = 404;
    throw error;
  }

  return prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
}

async function markAllAsRead(userId) {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}

/**
 * Creates an overspending or threshold notification with strict DB deduplication.
 * Avoids duplicate alerts for the same user, category, month, year, and threshold.
 */
async function createBudgetAlert({
  userId,
  categoryId,
  categoryName,
  month,
  year,
  threshold,
  spentAmount,
  budgetAmount,
}) {
  try {
    // 1. Deduplication check
    const existingAlert = await prisma.notification.findFirst({
      where: {
        userId,
        categoryId,
        month,
        year,
        threshold,
      },
    });

    if (existingAlert) {
      // Alert already triggered for this threshold crossing; prevent spamming
      return null;
    }

    // 2. Prepare message & title based on threshold
    let title = '';
    let message = '';
    let type = 'BUDGET_WARNING';

    if (threshold === 75) {
      title = `Budget Warning: ${categoryName}`;
      message = `You have utilized 75% of your monthly budget for ${categoryName} ($${spentAmount.toFixed(2)} of $${budgetAmount.toFixed(2)}).`;
      type = 'BUDGET_WARNING';
    } else if (threshold === 90) {
      title = `Budget Alert: ${categoryName}`;
      message = `You have reached 90% of your budget for ${categoryName} ($${spentAmount.toFixed(2)} of $${budgetAmount.toFixed(2)}). Consider curtailing further spending.`;
      type = 'BUDGET_WARNING';
    } else if (threshold === 100) {
      title = `Budget Limit Reached: ${categoryName}`;
      message = `You have reached 100% of your allocated budget for ${categoryName} ($${spentAmount.toFixed(2)} of $${budgetAmount.toFixed(2)}).`;
      type = 'BUDGET_EXCEEDED';
    } else if (threshold >= 101) {
      title = `Budget Exceeded: ${categoryName}`;
      message = `Alert! You have exceeded your budget for ${categoryName} by $${(spentAmount - budgetAmount).toFixed(2)} (Spent: $${spentAmount.toFixed(2)}, Limit: $${budgetAmount.toFixed(2)}).`;
      type = 'BUDGET_EXCEEDED';
    }

    // 3. Insert notification
    const notification = await prisma.notification.create({
      data: {
        userId,
        categoryId,
        title,
        message,
        type,
        month,
        year,
        threshold,
        isRead: false,
      },
    });

    logger.info(`Budget alert created for user ${userId}, category ${categoryName}, threshold ${threshold}%`);
    return notification;
  } catch (err) {
    logger.error('Failed to create budget alert notification', { error: err.message });
    return null;
  }
}

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  createBudgetAlert,
};
