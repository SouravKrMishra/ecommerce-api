const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const admin = require("../controllers/admin");
const { isAdmin } = require("../middlewares/isAdmin");
const validate = require("../middlewares/validationMiddleware");
const joiSchema = require("../middlewares/joiSchema");

//Admin Create Role
router.post(
  "/createRole",
  verifyToken,
  isAdmin,
  validate(joiSchema.createRoleSchema),
  admin.createRole
);

//Admin Login
router.post("/login", validate(joiSchema.loginSchema), admin.adminLogin);

//Add a Product
router.post(
  "/addProduct",
  verifyToken,
  isAdmin,
  validate(joiSchema.addProductSchema),
  admin.addProduct
);

// Edit a product
router.put(
  "/editProduct/",
  verifyToken,
  isAdmin,
  validate(joiSchema.editProductSchema),
  admin.editProduct
);

// Soft delete a product
router.post(
  "/deleteProduct",
  verifyToken,
  isAdmin,
  validate(joiSchema.deleteProductSchema),
  admin.deleteProduct
);

module.exports = router;
