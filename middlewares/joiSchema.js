const Joi = require("joi");

const signUpSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phoneNumber: Joi.number().required(),
  role: Joi.string().required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const addToCartSchema = Joi.object({
  productId: Joi.string().required(),
  quantity: Joi.number().min(1).required(),
});

const removeFromCartSchema = Joi.object({
  productId: Joi.string().required(),
});

const updateQuantitySchema = Joi.object({
  productId: Joi.string().required(),
  quantity: Joi.number().min(1).required(),
});

const createRoleSchema = Joi.object({
  name: Joi.string().required(),
});

const adminLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const addProductSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  price: Joi.number().required(),
  category: Joi.string().required(),
});

const editProductSchema = Joi.object({
  productId: Joi.string().required(),
  name: Joi.string().required(),
  description: Joi.string().optional(),
  price: Joi.number().optional(),
  deleted: Joi.boolean().default(false),
  category: Joi.string().optional(),
});

const deleteProductSchema = Joi.object({
  productId: Joi.string().required(),
});

const createTicketSchema = Joi.object({
  subject: Joi.string().required(),
  description: Joi.string().required(),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

const verifyotpSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.number().required(),
});
module.exports = {
  signUpSchema,
  loginSchema,
  addToCartSchema,
  removeFromCartSchema,
  updateQuantitySchema,
  createRoleSchema,
  adminLoginSchema,
  addProductSchema,
  editProductSchema,
  deleteProductSchema,
  createTicketSchema,
  forgotPasswordSchema,
  verifyotpSchema,
};
