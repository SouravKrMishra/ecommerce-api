const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const email = require("../controllers/email");
const validate = require("../middlewares/validationMiddleware");
const joiSchema = require("../middlewares/joiSchema");

router.post(
  "/createTicket",
  verifyToken,
  validate(joiSchema.createTicketSchema),
  email.createTicket
);

module.exports = router;
