const jwt = require("jsonwebtoken");
const User = require("../models/user");

async function verifyToken(req, res, next) {
  const token = req.header("x-authentication");
  const cookieToken = req.cookies.token;
  if (!token & !cookieToken)
    return res.status(401).json({
      statuscode: 401,
      message: "Access Denied",
    });

  try {
    // const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);
    // // console.log(decodedPayload);
    // req.user = decodedPayload;

    const cookieDecodedPayload = jwt.verify(
      cookieToken,
      process.env.JWT_SECRET
    );
    req.user = cookieDecodedPayload;

    // console.log(req.user);
    const userExist = await User.findById(req.user.userId);
    if (!userExist) {
      console.log(error);
      return res.status(400).json({
        statuscode: 400,
        message: "User Does Not Exist",
      });
    }
    // console.log("VerifyToken Middleware Ended Successfully");
    next();
  } catch (error) {
    return res.status(400).json({
      statuscode: 400,
      message: "Invalid token.",
    });
  }
}

module.exports = verifyToken;
