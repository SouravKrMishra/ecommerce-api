const express = require("express");
const router = express.Router();
const forgotPasswordController = require("../controllers/forgotPassword");
const validate = require("../middlewares/validationMiddleware");
const joiSchema = require("../middlewares/joiSchema");

router
  .post(
    "/",
    validate(joiSchema.forgotPasswordSchema),
    forgotPasswordController.forgotPassword
  )
  .post(
    "/verifyotp",
    validate(joiSchema.verifyotpSchema),
    forgotPasswordController.verifyotp
  );

module.exports = router;
