const User = require("../models/user");
const Product = require("../models/product");
const Role = require("../models/role");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//Admin CreateRole
async function createRole(req, res) {
  try {
    const { name } = req.body;
    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      return res.status(400).json({
        statuscode: 400,
        message: "Role already exists",
      });
    }
    const role = new Role({ name });
    await role.save();
    return res.status(201).json({
      statuscode: 201,
      message: "Role created successfully",
      role,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      statuscode: 500,
      message: error.message,
    });
  }
}

//Admin Login
async function adminLogin(req, res) {
  try {
    const { email, password } = req.body;
    const adminRole = await Role.findOne({ name: "admin" });
    if (!adminRole) {
      return res.status(500).json({
        statuscode: 500,
        message: "Admin role not found",
      });
    }

    const adminUser = await User.findOne({ email, role: adminRole._id });
    // console.log(adminUser);

    if (!adminUser) {
      return res.status(404).json({
        statuscode: 404,
        message: "Wrong Email",
      });
    }

    //Compare Password
    const isMatch = await bcrypt.compare(password, adminUser.password);
    if (!isMatch) {
      return res.status(400).json({
        statuscode: 400,
        message: "Invalid Password",
      });
    }

    const token = jwt.sign(
      {
        userId: adminUser._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "10h",
      }
    );
    return res.status(200).json({
      userId: adminUser._id,
      token,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      statuscode: 500,
      message: error.message,
    });
  }
}

//Add Product
async function addProduct(req, res) {
  try {
    let { name, description, price, category } = req.body;
    // let existingProduct = await Product.findOne({ name, deleted: false });
    // if (existingProduct) {
    //   return res.status(400).json({
    //     statuscode: 400,
    //     message: "Product Already Exists!",
    //   });
    // }
    let userID = await User.findById(req.user.userId);
    // console.log(userID);

    const product = await Product.create({
      name,
      description,
      price,
      user: userID,
      category,
    });
    await product.save();

    const result = await Product.aggregate([
      {
        $match: { _id: product._id },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: "$userDetails",
      },
      {
        $project: {
          "userDetails.password": 0,
        },
      },
    ]);

    return res.status(201).json({
      statuscode: 201,
      message: "Product added successfully",
      product: result[0],
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
}

//Edit Product
// async function editProduct(req, res) {
//   try {
//     const { name, description, price, deleted, productId } = req.body;
//     const objectId = new mongoose.Types.ObjectId(productId);
//     let product = await Product.findById({ objectId });
//     if (!product) {
//       return res.status(404).json({
//         statuscode: 404,
//         message: "The Product does not Exist!",
//       });
//     }
//     // let existingProduct = await Product.findOne({
//     //   name: newName,
//     //   deleted: false,
//     // });
//     // console.log(newProduct, newName);
//     // if (existingProduct) {
//     //   return res.status(400).json({
//     //     statuscode: 400,
//     //     message: "Product Already Exists!",
//     //   });
//     // }
//     // const entry = await Product.findOneAndUpdate(
//     //   {
//     //     productId,
//     //   },
//     //   {
//     //     $set: { name, description, price, deleted, category },
//     //   },
//     //   {
//     //     new: true,
//     //   }
//     // );
//     product.name = name;
//     product.description = description;
//     product.price = price;
//     product.deleted = deleted;
//     product.category = category;

//     await product.save();

//     return res.status(200).json({
//       statuscode: 200,
//       message: "Product edited Successfully",
//       data: product,
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({ message: error.message });
//   }
// }

// controllers/admin.js

async function editProduct(req, res) {
  try {
    const { productId, name, description, price, deleted, category } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        statuscode: 400,
        message: "Invalid product ID",
      });
    }

    let product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        statuscode: 404,
        message: "Product not found",
      });
    }

    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = price;
    if (deleted !== undefined) product.deleted = deleted;
    if (category) product.category = category;

    await product.save();

    return res.status(200).json({
      statuscode: 200,
      message: "Product edited successfully",
      data: product,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
}
//Delete Product
async function deleteProduct(req, res) {
  try {
    const { productId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        statuscode: 400,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        statuscode: 404,
        message: "Product Not Found",
      });
    }
    // const deletedProduct = await Product.findOneAndUpdate(
    //   { productId },
    //   { deleted: true },
    //   { new: true }
    // );

    product.deleted = true;

    await product.save();

    return res.status(200).json({
      statuscode: 200,
      data: product,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      statuscode: 500,
      message: error.message,
    });
  }
}

module.exports = {
  createRole,
  adminLogin,
  addProduct,
  editProduct,
  deleteProduct,
};
