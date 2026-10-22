const { z } = require('zod');

const setBudgetSchema = {
  body: z.object({
    categoryId: z.string().min(1, 'Category ID is required'),
    month: z.coerce.number().int().min(1, 'Month must be between 1 and 12').max(12),
    year: z.coerce.number().int().min(2000, 'Year must be 2000 or later'),
    amount: z.coerce.number().positive('Budget amount must be greater than zero'),
  }),
};

const updateBudgetSchema = {
  params: z.object({
    id: z.string().min(1, 'Budget ID is required'),
  }),
  body: z.object({
    amount: z.coerce.number().positive('Budget amount must be greater than zero'),
  }),
};

const queryBudgetSchema = {
  query: z.object({
    month: z.coerce.number().int().min(1).max(12).optional(),
    year: z.coerce.number().int().min(2000).optional(),
  }),
};

const budgetIdParamSchema = {
  params: z.object({
    id: z.string().min(1, 'Budget ID is required'),
  }),
};

module.exports = {
  setBudgetSchema,
  updateBudgetSchema,
  queryBudgetSchema,
  budgetIdParamSchema,
};
