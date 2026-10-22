const { z } = require('zod');

const createRecurringSchema = {
  body: z.object({
    title: z.string().min(1, 'Title is required').max(150),
    amount: z.coerce.number().positive('Amount must be greater than zero'),
    type: z.enum(['INCOME', 'EXPENSE']),
    categoryId: z.string().min(1, 'Category is required'),
    paymentMethod: z.string().max(50).optional().default('Bank Transfer'),
    startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid start date format',
    }),
    endDate: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: 'Invalid end date format',
      })
      .optional()
      .nullable(),
    frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']),
  }),
};

const updateRecurringSchema = {
  params: z.object({
    id: z.string().min(1, 'Recurring rule ID is required'),
  }),
  body: z.object({
    title: z.string().min(1).max(150).optional(),
    amount: z.coerce.number().positive().optional(),
    type: z.enum(['INCOME', 'EXPENSE']).optional(),
    categoryId: z.string().min(1).optional(),
    paymentMethod: z.string().max(50).optional(),
    startDate: z.string().refine((val) => !isNaN(Date.parse(val))).optional(),
    endDate: z.string().refine((val) => !isNaN(Date.parse(val))).optional().nullable(),
    frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']).optional(),
    isActive: z.boolean().optional(),
  }),
};

const recurringIdParamSchema = {
  params: z.object({
    id: z.string().min(1, 'Recurring rule ID is required'),
  }),
};

module.exports = {
  createRecurringSchema,
  updateRecurringSchema,
  recurringIdParamSchema,
};
