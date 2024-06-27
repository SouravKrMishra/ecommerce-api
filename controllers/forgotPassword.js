const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const twilio = require("twilio");
const User = require("../models/user");
const OTP = require("../models/otp");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = new twilio(accountSid, authToken);

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: "jamie.botsford64@ethereal.email",
    pass: "dEVUmZJt6zPjH5z7Hh",
  },
});

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        statuscode: 404,
        message: "User not found",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOTP = await bcrypt.hash(otp, 10);

    // await OTP.deleteOne({ email });
    const otpExpiration = new Date(Date.now() + 1 * 60 * 1000);
    await OTP.create({ email, otp: hashedOTP, expiration: otpExpiration });

    await transporter.sendMail({
      from: process.env.NOREPLY_EMAIL,
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is: ${otp}. It will expire in 5 minutes.`,
    });

    return res.status(200).json({
      statuscode: 200,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      statuscode: 500,
      message: error.message,
    });
  }
};

// exports.forgotPassword = async (req, res) => {
//   try {
//     const { email } = req.body;

//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(404).json({
//         statuscode: 404,
//         message: "User not found",
//       });
//     }

//     const otp = Math.floor(100000 + Math.random() * 900000).toString();
//     const hashedOTP = await bcrypt.hash(otp, 10);

//     // await OTP.deleteOne({ email });
//     // const otpExpiration = new Date(Date.now() + 5 * 60 * 1000);
//     await OTP.create({ email, otp: hashedOTP });

//     await client.messages.create({
//       body: `Your OTP is ${otp}`,
//       from: `+18156058004`,
//       to: `+91` + `${user.phoneNumber}`,
//     });

//     return res.status(200).json({
//       statuscode: 200,
//       message: "OTP sent successfully",
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({
//       statuscode: 500,
//       message: error.message,
//     });
//   }
// };

exports.verifyotp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const verificationOTP = await OTP.find({ email });
    if (!verificationOTP) {
      return res.status(400).json({
        statuscode: 400,
        message: "OTP not found",
      });
    }

    // console.log(verificationOTP[0].otp);
    const hashedOTP = await bcrypt.compare(otp, verificationOTP[0].otp);
    // console.log(hashedOTP);

    if (!hashedOTP) {
      return res.status(400).json({
        statuscode: 400,
        message: "Invalid OTP",
      });
    }

    if (verificationOTP[0].expiration < Date.now()) {
      return res.status(400).json({
        statuscode: 400,
        message: "OTP has expired",
      });
    }
    await OTP.deleteOne({ email });

    return res.status(200).json({
      statuscode: 200,
      message: "OTP verified Successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      statuscode: 500,
      message: error.message,
    });
  }
};
