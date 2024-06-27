const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  expiration: {
    type: Date,
    required: true,
    index: { expires: "1m" },
  },
});

const OTP = mongoose.model("OTP", otpSchema);

module.exports = OTP;
