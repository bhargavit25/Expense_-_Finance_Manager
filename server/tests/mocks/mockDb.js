const { Prisma } = require('@prisma/client');
const bcrypt = require('bcryptjs');

class MockDatabase {
  constructor() {
    this.reset();
  }

  reset() {
    this.users = [];
    this.categories = [];
    this.transactions = [];
    this.budgets = [];
    this.notifications = [];
    this.recurringTransactions = [];
    this.recurringTransactionExecutions = [];

    // Seed default categories
    const defaults = [
      { id: 'cat-food', name: 'Food & Dining', type: 'EXPENSE', color: '#F97316', isDefault: true, userId: null },
      { id: 'cat-transport', name: 'Transportation', type: 'EXPENSE', color: '#0EA5E9', isDefault: true, userId: null },
      { id: 'cat-rent', name: 'Rent & Housing', type: 'EXPENSE', color: '#6366F1', isDefault: true, userId: null },
      { id: 'cat-salary', name: 'Salary', type: 'INCOME', color: '#10B981', isDefault: true, userId: null },
      { id: 'cat-freelance', name: 'Freelance', type: 'INCOME', color: '#059669', isDefault: true, userId: null },
    ];
    this.categories.push(...defaults);
  }

  get user() {
    return {
      findUnique: async ({ where, select }) => {
        let u = null;
        if (where.email) u = this.users.find((user) => user.email === where.email) || null;
        if (where.id) u = this.users.find((user) => user.id === where.id) || null;
        if (!u) return null;
        if (select) {
          const projected = {};
          for (const key of Object.keys(select)) {
            if (select[key]) projected[key] = u[key];
          }
          return projected;
        }
        return u;
      },
      create: async ({ data, select }) => {
        const newUser = {
          id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          name: data.name,
          email: data.email,
          password: data.password,
          currency: data.currency || 'USD',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        this.users.push(newUser);
        if (select) {
          const projected = {};
          for (const key of Object.keys(select)) {
            if (select[key]) projected[key] = newUser[key];
          }
          return projected;
        }
        return newUser;
      },
      update: async ({ where, data }) => {
        const u = this.users.find((user) => user.id === where.id);
        if (!u) throw new Error('User not found');
        Object.assign(u, data, { updatedAt: new Date() });
        return u;
      },
    };
  }

  get category() {
    return {
      findMany: async ({ where } = {}) => {
        let list = [...this.categories];
        if (where?.OR) {
          const userId = where.OR.find((o) => o.userId !== undefined)?.userId;
          list = list.filter((c) => c.userId === null || c.userId === userId);
        }
        return list;
      },
      findFirst: async ({ where }) => {
        return (
          this.categories.find((c) => {
            if (where.id && c.id !== where.id) return false;
            if (where.name && c.name.toLowerCase() !== where.name.toLowerCase()) return false;
            if (where.type && c.type !== where.type) return false;
            return true;
          }) || null
        );
      },
      findUnique: async ({ where }) => {
        const cat = this.categories.find((c) => c.id === where.id);
        if (!cat) return null;
        return {
          ...cat,
          _count: {
            transactions: this.transactions.filter((t) => t.categoryId === cat.id).length,
            budgets: this.budgets.filter((b) => b.categoryId === cat.id).length,
            recurringTransactions: this.recurringTransactions.filter((r) => r.categoryId === cat.id).length,
          },
        };
      },
      create: async ({ data }) => {
        const newCat = {
          id: `cat-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          name: data.name,
          type: data.type,
          color: data.color || '#6366F1',
          icon: data.icon || 'Folder',
          isDefault: !!data.isDefault,
          userId: data.userId || null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        this.categories.push(newCat);
        return newCat;
      },
      update: async ({ where, data }) => {
        const cat = this.categories.find((c) => c.id === where.id);
        if (!cat) throw new Error('Category not found');
        Object.assign(cat, data, { updatedAt: new Date() });
        return cat;
      },
      delete: async ({ where }) => {
        const idx = this.categories.findIndex((c) => c.id === where.id);
        if (idx !== -1) this.categories.splice(idx, 1);
        return { id: where.id };
      },
    };
  }

  get transaction() {
    return {
      create: async ({ data, include }) => {
        const cat = this.categories.find((c) => c.id === data.categoryId);
        const newTx = {
          id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          userId: data.userId,
          title: data.title,
          amount: data.amount instanceof Prisma.Decimal ? data.amount : new Prisma.Decimal(data.amount),
          type: data.type,
          categoryId: data.categoryId,
          category: cat,
          date: new Date(data.date),
          paymentMethod: data.paymentMethod || 'Cash',
          notes: data.notes || null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        this.transactions.push(newTx);
        return newTx;
      },
      findMany: async ({ where, skip = 0, take = 50, orderBy } = {}) => {
        let list = this.transactions.filter((t) => {
          if (where.userId && t.userId !== where.userId) return false;
          if (where.type && t.type !== where.type) return false;
          if (where.categoryId && t.categoryId !== where.categoryId) return false;
          if (where.date?.gte && t.date < where.date.gte) return false;
          if (where.date?.lte && t.date > where.date.lte) return false;
          if (where.OR) {
            const matchesSearch = where.OR.some(
              (clause) =>
                (clause.title && t.title.toLowerCase().includes(clause.title.contains.toLowerCase())) ||
                (clause.notes && t.notes && t.notes.toLowerCase().includes(clause.notes.contains.toLowerCase()))
            );
            if (!matchesSearch) return false;
          }
          return true;
        });

        if (orderBy?.date === 'desc') list.sort((a, b) => b.date - a.date);
        else if (orderBy?.date === 'asc') list.sort((a, b) => a.date - b.date);

        return list.slice(skip, skip + take);
      },
      count: async ({ where } = {}) => {
        return (await this.transaction.findMany({ where })).length;
      },
      findFirst: async ({ where }) => {
        return (
          this.transactions.find((t) => {
            if (where.id && t.id !== where.id) return false;
            if (where.userId && t.userId !== where.userId) return false;
            return true;
          }) || null
        );
      },
      aggregate: async ({ where, _sum }) => {
        const matches = this.transactions.filter((t) => {
          if (where.userId && t.userId !== where.userId) return false;
          if (where.type && t.type !== where.type) return false;
          if (where.categoryId && t.categoryId !== where.categoryId) return false;
          if (where.date?.gte && t.date < where.date.gte) return false;
          if (where.date?.lte && t.date > where.date.lte) return false;
          return true;
        });

        const total = matches.reduce((acc, t) => acc.plus(t.amount), new Prisma.Decimal(0));
        return { _sum: { amount: total } };
      },
      update: async ({ where, data }) => {
        const t = this.transactions.find((tx) => tx.id === where.id);
        if (!t) throw new Error('Transaction not found');
        if (data.amount) data.amount = data.amount instanceof Prisma.Decimal ? data.amount : new Prisma.Decimal(data.amount);
        Object.assign(t, data, { updatedAt: new Date() });
        return t;
      },
      delete: async ({ where }) => {
        const idx = this.transactions.findIndex((t) => t.id === where.id);
        if (idx !== -1) this.transactions.splice(idx, 1);
        return { id: where.id };
      },
    };
  }

  get budget() {
    return {
      findMany: async ({ where }) => {
        return this.budgets
          .filter((b) => {
            if (where.userId && b.userId !== where.userId) return false;
            if (where.month && b.month !== where.month) return false;
            if (where.year && b.year !== where.year) return false;
            return true;
          })
          .map((b) => ({
            ...b,
            category: this.categories.find((c) => c.id === b.categoryId),
          }));
      },
      findUnique: async ({ where }) => {
        const composite = where.userId_categoryId_month_year;
        if (composite) {
          const b = this.budgets.find(
            (item) =>
              item.userId === composite.userId &&
              item.categoryId === composite.categoryId &&
              item.month === composite.month &&
              item.year === composite.year
          );
          if (!b) return null;
          return {
            ...b,
            category: this.categories.find((c) => c.id === b.categoryId),
          };
        }
        return null;
      },
      findFirst: async ({ where }) => {
        return this.budgets.find((b) => {
          if (where.id && b.id !== where.id) return false;
          if (where.userId && b.userId !== where.userId) return false;
          return true;
        }) || null;
      },
      upsert: async ({ where, update, create, include }) => {
        const existing = await this.budget.findUnique({ where });
        if (existing) {
          Object.assign(existing, {
            amount: update.amount instanceof Prisma.Decimal ? update.amount : new Prisma.Decimal(update.amount),
            updatedAt: new Date(),
          });
          return existing;
        }
        const newBudget = {
          id: `budget-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          userId: create.userId,
          categoryId: create.categoryId,
          month: create.month,
          year: create.year,
          amount: create.amount instanceof Prisma.Decimal ? create.amount : new Prisma.Decimal(create.amount),
          category: this.categories.find((c) => c.id === create.categoryId),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        this.budgets.push(newBudget);
        return newBudget;
      },
      update: async ({ where, data }) => {
        const b = this.budgets.find((item) => item.id === where.id);
        if (!b) throw new Error('Budget not found');
        Object.assign(b, {
          amount: data.amount instanceof Prisma.Decimal ? data.amount : new Prisma.Decimal(data.amount),
          updatedAt: new Date(),
        });
        return {
          ...b,
          category: this.categories.find((c) => c.id === b.categoryId),
        };
      },
      delete: async ({ where }) => {
        const idx = this.budgets.findIndex((b) => b.id === where.id);
        if (idx !== -1) this.budgets.splice(idx, 1);
        return { id: where.id };
      },
    };
  }

  get notification() {
    return {
      findMany: async ({ where, take = 50, orderBy }) => {
        const list = this.notifications.filter((n) => {
          if (where.userId && n.userId !== where.userId) return false;
          if (where.isRead !== undefined && n.isRead !== where.isRead) return false;
          return true;
        });
        list.sort((a, b) => b.createdAt - a.createdAt);
        return list.slice(0, take).map((n) => ({
          ...n,
          category: this.categories.find((c) => c.id === n.categoryId),
        }));
      },
      count: async ({ where }) => {
        return (await this.notification.findMany({ where })).length;
      },
      findFirst: async ({ where }) => {
        return (
          this.notifications.find((n) => {
            if (where.id && n.id !== where.id) return false;
            if (where.userId && n.userId !== where.userId) return false;
            if (where.categoryId && n.categoryId !== where.categoryId) return false;
            if (where.month && n.month !== where.month) return false;
            if (where.year && n.year !== where.year) return false;
            if (where.threshold && n.threshold !== where.threshold) return false;
            return true;
          }) || null
        );
      },
      create: async ({ data }) => {
        const newNotif = {
          id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          userId: data.userId,
          title: data.title,
          message: data.message,
          type: data.type || 'BUDGET_WARNING',
          month: data.month,
          year: data.year,
          threshold: data.threshold,
          categoryId: data.categoryId,
          isRead: !!data.isRead,
          createdAt: new Date(),
        };
        this.notifications.push(newNotif);
        return newNotif;
      },
      update: async ({ where, data }) => {
        const n = this.notifications.find((item) => item.id === where.id);
        if (!n) throw new Error('Notification not found');
        Object.assign(n, data);
        return n;
      },
      updateMany: async ({ where, data }) => {
        let count = 0;
        this.notifications.forEach((n) => {
          if (where.userId && n.userId !== where.userId) return;
          if (where.isRead !== undefined && n.isRead !== where.isRead) return;
          Object.assign(n, data);
          count++;
        });
        return { count };
      },
    };
  }

  get recurringTransaction() {
    return {
      findMany: async ({ where }) => {
        return this.recurringTransactions
          .filter((r) => {
            if (where?.userId && r.userId !== where.userId) return false;
            if (where?.isActive !== undefined && r.isActive !== where.isActive) return false;
            if (where?.nextExecutionDate?.lte && r.nextExecutionDate > where.nextExecutionDate.lte) return false;
            return true;
          })
          .map((r) => ({
            ...r,
            category: this.categories.find((c) => c.id === r.categoryId),
            executions: this.recurringTransactionExecutions.filter((e) => e.recurringTransactionId === r.id),
          }));
      },
      findFirst: async ({ where }) => {
        return this.recurringTransactions.find((r) => {
          if (where.id && r.id !== where.id) return false;
          if (where.userId && r.userId !== where.userId) return false;
          return true;
        }) || null;
      },
      create: async ({ data }) => {
        const newRule = {
          id: `rec-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          userId: data.userId,
          title: data.title,
          amount: data.amount instanceof Prisma.Decimal ? data.amount : new Prisma.Decimal(data.amount),
          type: data.type,
          categoryId: data.categoryId,
          paymentMethod: data.paymentMethod || 'Bank Transfer',
          startDate: new Date(data.startDate),
          endDate: data.endDate ? new Date(data.endDate) : null,
          frequency: data.frequency,
          nextExecutionDate: new Date(data.nextExecutionDate),
          lastExecutedAt: null,
          isActive: data.isActive !== undefined ? data.isActive : true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        this.recurringTransactions.push(newRule);
        return newRule;
      },
      update: async ({ where, data }) => {
        const r = this.recurringTransactions.find((rule) => rule.id === where.id);
        if (!r) throw new Error('Rule not found');
        if (data.amount) data.amount = data.amount instanceof Prisma.Decimal ? data.amount : new Prisma.Decimal(data.amount);
        Object.assign(r, data, { updatedAt: new Date() });
        return {
          ...r,
          category: this.categories.find((c) => c.id === r.categoryId),
        };
      },
      delete: async ({ where }) => {
        const idx = this.recurringTransactions.findIndex((r) => r.id === where.id);
        if (idx !== -1) this.recurringTransactions.splice(idx, 1);
        return { id: where.id };
      },
    };
  }

  get recurringTransactionExecution() {
    return {
      findUnique: async ({ where }) => {
        if (where.idempotencyKey) {
          return this.recurringTransactionExecutions.find((e) => e.idempotencyKey === where.idempotencyKey) || null;
        }
        return null;
      },
      create: async ({ data }) => {
        const newExec = {
          id: `exec-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          recurringTransactionId: data.recurringTransactionId,
          transactionId: data.transactionId,
          scheduledDate: new Date(data.scheduledDate),
          executedAt: new Date(),
          status: data.status || 'SUCCESS',
          idempotencyKey: data.idempotencyKey,
          errorMessage: data.errorMessage || null,
        };
        this.recurringTransactionExecutions.push(newExec);
        return newExec;
      },
    };
  }

  async $transaction(fn) {
    if (typeof fn === 'function') {
      return fn(this);
    }
    return Promise.all(fn);
  }

  async $disconnect() {
    return true;
  }
}

const mockDb = new MockDatabase();
module.exports = mockDb;
