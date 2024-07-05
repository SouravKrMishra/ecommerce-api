const express = require("express");
const router = express.Router();
const validate = require("../middlewares/validationMiddleware");
const joiSchema = require("../middlewares/joiSchema");
const verifyToken = require("../middlewares/verifyToken");
const user = require("../controllers/user");

router

  .post("/signup", validate(joiSchema.signUpSchema), user.signUp)

  /**
   * @swagger
   * /user/login:
   *   post:
   *     summary: User login
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *               password:
   *                 type: string
   *     responses:
   *       200:
   *         description: User logged in successfully
   *       400:
   *         description: Invalid credentials
   *       500:
   *         description: Internal server error
   */
  .post("/login", validate(joiSchema.loginSchema), user.userLogin)
  .get("/getAllProduct", verifyToken, user.getAllProduct)
  .post(
    "/addToCart",
    verifyToken,
    validate(joiSchema.addToCartSchema),
    user.addToCart
  )
  .post(
    "/removeFromCart",
    verifyToken,
    validate(joiSchema.removeFromCartSchema),
    user.removeFromCart
  )
  .post(
    "/updateQuantity",
    verifyToken,
    validate(joiSchema.updateQuantitySchema),
    user.updateQuantity
  )
  .get("/getTotalCost", verifyToken, user.getTotalCost)
  .post("/buyProducts", verifyToken, user.buyProduct)
  .get("/userPurchaseHistory", verifyToken, user.userPurchaseHistory)
  .get("/getProductByCategory", verifyToken, user.getProductByCategory)
  .get("/getProductUnderCategory", verifyToken, user.getProductUnderCategory);
module.exports = router;
