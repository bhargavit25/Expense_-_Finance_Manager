const { z } = require('zod');

const registerSchema = {
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Please enter a valid email address').toLowerCase().trim(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),
    currency: z.string().length(3, 'Currency must be a 3-letter code').optional().default('INR'),
  }),
};

const loginSchema = {
  body: z.object({
    email: z.string().email('Please enter a valid email address').toLowerCase().trim(),
    password: z.string().min(1, 'Password is required'),
  }),
};

const changePasswordSchema = {
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters long')
      .regex(/[0-9]/, 'New password must contain at least one number')
      .regex(/[^a-zA-Z0-9]/, 'New password must contain at least one special character'),
  }),
};

const updateProfileSchema = {
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
    currency: z.string().length(3, 'Currency code must be 3 characters (e.g. USD)').optional(),
  }),
};

module.exports = {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  updateProfileSchema,
};
