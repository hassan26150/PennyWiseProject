const { z } = require('zod');

const createProductSchema = z.object({
  name: z.string().min(3, 'Product name must be at least 3 characters'),
  category_id: z.string().min(1, 'Category ID is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  short_description: z.string().optional(),
  price: z.coerce.number().min(0, 'Price must be a positive number'),
  stock_quantity: z.coerce.number().int().min(0, 'Stock cannot be negative'),
  attributes: z.string().optional(), // Expected to be JSON string from FormData
});

const updateProductSchema = z.object({
  name: z.string().min(3).optional(),
  category_id: z.string().optional(),
  description: z.string().min(10).optional(),
  short_description: z.string().optional(),
  price: z.coerce.number().min(0).optional(),
  stock_quantity: z.coerce.number().int().min(0).optional(),
  attributes: z.string().optional(),
});

module.exports = {
  createProductSchema,
  updateProductSchema,
};
