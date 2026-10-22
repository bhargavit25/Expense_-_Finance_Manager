const { z } = require('zod');

const createCategorySchema = {
  body: z.object({
    name: z.string().min(1, 'Category name is required').max(50).trim(),
    type: z.enum(['INCOME', 'EXPENSE'], {
      errorMap: () => ({ message: "Type must be either 'INCOME' or 'EXPENSE'" }),
    }),
    color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Must be a valid hex color code').optional().default('#6366F1'),
    icon: z.string().max(50).optional().default('Folder'),
  }),
};

const updateCategorySchema = {
  params: z.object({
    id: z.string().min(1, 'Category ID is required'),
  }),
  body: z.object({
    name: z.string().min(1, 'Category name is required').max(50).trim().optional(),
    color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Must be a valid hex color code').optional(),
    icon: z.string().max(50).optional(),
  }),
};

const deleteCategorySchema = {
  params: z.object({
    id: z.string().min(1, 'Category ID is required'),
  }),
  query: z.object({
    reassignToCategoryId: z.string().optional(),
  }),
};

module.exports = {
  createCategorySchema,
  updateCategorySchema,
  deleteCategorySchema,
};
