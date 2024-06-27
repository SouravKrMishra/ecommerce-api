const User = require("../models/user");
const Role = require("../models/role");

exports.isAdmin = async (req, res, next) => {
  try {
    // console.log("Request User:", req.user);
    const adminRole = await Role.findOne({ name: "admin" });
    if (!adminRole) {
      return res.status(404).json({
        statusCode: 404,
        message: "Admin Role Not Found",
      });
    }
    const user = await User.findById(req.user.userId).populate("role");
    // console.log(user.role._id, adminRole._id);
    if (!user.role._id.equals(adminRole._id)) {
      return res.status(403).json({
        statusCode: 403,
        message: "Forbidden",
      });
    }
    // console.log("isAdmin Finished Successfully");
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
};
