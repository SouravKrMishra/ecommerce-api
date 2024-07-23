const express = require("express");
const router = express.Router();
const validate = require("../middlewares/validationMiddleware");
const joiSchema = require("../middlewares/joiSchema");
const verifyToken = require("../middlewares/verifyToken");
const { isAdmin } = require("../middlewares/isAdmin");
const user = require("../controllers/user");

router
  .post("/signup", validate(joiSchema.signUpSchema), user.signUp)
  .get("/signup", user.getSignUp)
  .post("/login", validate(joiSchema.loginSchema), user.userLogin)
  .get("/login", user.getUserLogin)
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
  .get("/getProductUnderCategory", verifyToken, user.getProductUnderCategory)
  .get("/verify-email", user.verifyEmail)
  .get("/home", user.getHomePage)
  .post("/block", user.blockUser)
  .post("/unblock", user.unblockUser)
  .post("/chat", verifyToken, user.startChat)
  .get("/register", user.getUserLogin);
module.exports = router;
