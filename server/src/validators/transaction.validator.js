const { z } = require('zod');

const createTransactionSchema = {
  body: z.object({
    title: z.string().min(1, 'Title is required').max(150),
    amount: z.coerce.number().positive('Amount must be greater than zero'),
    type: z.enum(['INCOME', 'EXPENSE'], {
      errorMap: () => ({ message: "Type must be either 'INCOME' or 'EXPENSE'" }),
    }),
    categoryId: z.string().min(1, 'Category is required'),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid transaction date format',
    }),
    paymentMethod: z.string().max(50).optional().default('Cash'),
    notes: z.string().max(500).optional().nullable(),
  }),
};

const updateTransactionSchema = {
  params: z.object({
    id: z.string().min(1, 'Transaction ID is required'),
  }),
  body: z.object({
    title: z.string().min(1, 'Title cannot be empty').max(150).optional(),
    amount: z.coerce.number().positive('Amount must be greater than zero').optional(),
    type: z.enum(['INCOME', 'EXPENSE']).optional(),
    categoryId: z.string().min(1).optional(),
    date: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: 'Invalid transaction date format',
      })
      .optional(),
    paymentMethod: z.string().max(50).optional(),
    notes: z.string().max(500).optional().nullable(),
  }),
};

const queryTransactionsSchema = {
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(10),
    search: z.string().optional(),
    type: z.enum(['INCOME', 'EXPENSE']).optional(),
    categoryId: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    sortBy: z.enum(['date', 'amount', 'title', 'createdAt']).optional().default('date'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
};

const transactionIdParamSchema = {
  params: z.object({
    id: z.string().min(1, 'Transaction ID is required'),
  }),
};

module.exports = {
  createTransactionSchema,
  updateTransactionSchema,
  queryTransactionsSchema,
  transactionIdParamSchema,
};
