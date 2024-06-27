const User = require("../models/user");
const Product = require("../models/product");
const Role = require("../models/role");
const Cart = require("../models/cart");
const PurchaseHistory = require("../models/purchaseHistory");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

async function signUp(req, res) {
  try {
    const { name, email, password, phoneNumber, role } = req.body;
    // console.log(req.body);
    try {
      const hash = await bcrypt.hash(password, 10);
      const roleDoc = await Role.findOne({ name: role });
      if (!roleDoc) {
        return res.status(400).json({
          statuscode: 400,
          message: "Invalid Role",
        });
      }
      const user1 = {
        name,
        email,
        password: hash,
        phoneNumber,
        role: roleDoc._id,
      };
      var user = await User.create(user1);
      const token = jwt.sign(
        {
          userId: user.id,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "72h",
        }
      );
      // console.log(token);
      user1.token = token;
      delete user1.password;
      return res.status(201).json({
        statuscode: 201,
        message: "User created successfully",
        data: user1,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        statuscode: 500,
        message: error.message,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      statuscode: 400,
      message: error.message,
    });
  }
}

async function userLogin(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        statuscode: 404,
        message: "User Not Found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        statuscode: 400,
        message: "Invalid Password",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        userRole: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "24h",
      }
    );

    return res.status(200).json({
      userId: user._id,
      token,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      statuscode: 400,
      message: error.message,
    });
  }
}

async function getAllProduct(req, res) {
  try {
    const products = await Product.find({ deleted: false });
    if (!products || products.length === 0) {
      return res.status(404).json({
        statuscode: 404,
        message: "No products found.",
      });
    }

    return res.status(200).json({
      statuscode: 200,
      totalProduct: products.length,
      data: products,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      statuscode: 200,
      message: "Server error",
    });
  }
}

async function addToCart(req, res) {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.userId;

    const product = await Product.findOne({ _id: productId, deleted: false });
    if (!product) {
      return res.status(404).json({
        statuscode: 404,
        message: "Product not found",
      });
    }

    let cart = await Cart.findOne({ user: userId });

    if (cart) {
      const productIndex = cart.products.findIndex(
        (item) => item.product.toString() === productId
      );
      if (productIndex > -1) {
        cart.products[productIndex].quantity += quantity;
      } else {
        cart.products.push({ product: productId, quantity });
      }
      cart = await cart.save();
    } else {
      cart = await Cart.create({
        user: userId,
        products: [{ product: productId, quantity }],
      });
    }
    return res.status(200).json({
      statuscode: 200,
      message: "Product Successfully Added",
      data: cart,
    });
    //   const product = await Product.findOne({ _id: productId, deleted: false });
    //   // console.log(product);

    //   if (!product) {
    //     return res.status(404).json({
    //       statuscode: 404,
    //       message: "Product Not Found!",
    //     });
    //   }
    //   // console.log(req.user);
    //   const user = await User.findOne(req.user.userId);
    //   // console.log(user);

    //   const itemIndex = user.cart.findIndex(
    //     (item) => item.productId.toString() === productId.toString()
    //   );
    //   // console.log(itemIndex);

    //   if (itemIndex >= 0) {
    //     // Product exists in cart, update quantity
    //     user.cart[itemIndex].quantity += quantity;
    //   } else {
    //     // Product does not exist in cart, add new item
    //     user.cart.push({ productId, quantity });
    //   }

    //   await user.save();
    //   res.status(200).json(user.cart);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      statuscode: 500,
      message: error.message,
    });
  }
}

async function removeFromCart(req, res) {
  try {
    const { productId } = req.body;
    const userId = req.user.userId;

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({
        statuscode: 404,
        message: "Cart not found",
      });
    }

    const itemIndex = cart.products.findIndex(
      (item) => item.product.toString() === productId.toString()
    );

    if (itemIndex < 0) {
      return res.status(404).json({
        statuscode: 404,
        message: "Item not found in cart",
      });
    }
    cart.products.splice(itemIndex, 1);
    await cart.save();

    return res.status(200).json({
      statuscode: 200,
      message: "Item removed from cart successfully",
      cart,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      statuscode: 500,
      message: error.message,
    });
  }
}

async function updateQuantity(req, res) {
  try {
    const { productId, quantity } = req.body;
    // const user = await User.findById(req.user.userId);

    // if (!user) {
    //   return res.status(404).json({
    //     statuscode: 404,
    //     message: "User not found",
    //   });
    // }

    const userId = req.user.userId;

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        statuscode: 404,
        message: "Cart Not Found",
      });
    }

    const product = await Product.findOne({ _id: productId, deleted: false });
    if (!product) {
      return res.status(404).json({
        statuscode: 404,
        message: "Product not found or has been deleted",
      });
    }

    const productIndex = cart.products.findIndex(
      (item) => item.product.toString() === productId.toString()
    );

    if (productIndex < 0) {
      return res.status(404).json({
        statuscode: 404,
        message: "Product not found in cart",
      });
    }

    cart.products[productIndex].quantity = quantity;
    cart = await cart.save();

    return res.status(200).json({
      statuscode: 200,
      message: "Product updated successfully",
      cart,
    });
    // if (await Product.findOne({ _id: productId, deleted: false })) {
    //   return res.status(400).json({ message: error.message });
    // }

    // const itemIndex = user.cart.findIndex(
    //   (item) => item.productId.toString() === productId.toString()
    // );

    // if (itemIndex < 0) {
    //   return res.status(404).json({
    //     statuscode: 404,
    //     message: "Item not found in cart",
    //   });
    // }

    // user.cart[itemIndex].quantity = quantity;
    // await user.save();

    // res.status(200).json({
    //   statuscode: 200,
    //   message: "Item quantity updated successfully",
    //   cart: user.cart,
    // });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      statuscode: 500,
      message: error.message,
    });
  }
}

async function getTotalCost(req, res) {
  try {
    // const user = await User.findById(req.user.userId);

    // if (!user) {
    //   return res.status(404).json({
    //     statuscode: 404,
    //     message: "User not found",
    //   });
    // }

    const userId = req.user.userId;
    let cart = await Cart.findOne({ user: userId }).populate(
      "products.product"
    );

    if (!cart) {
      return res.status(404).json({
        statuscode: 404,
        message: "Cart Not Found",
      });
    }

    const productPromises = cart.products.map(async (cartItem) => {
      const product = await Product.findById(cartItem.product);
      return product ? product.price : 0;
    });

    const prices = await Promise.all(productPromises);

    const totalCost = cart.products.reduce((total, cartItem, index) => {
      return total + prices[index] * cartItem.quantity;
    }, 0);

    return res.status(200).json({
      statuscode: 200,
      message: "Total cost calculated successfully",
      totalCost,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      statuscode: 500,
      message: error.message,
    });
  }
}

async function buyProduct(req, res) {
  try {
    const userId = req.user.userId;
    let cart = await Cart.findOne({ user: userId }).populate(
      "products.product"
    );

    if (!cart || cart.products.length === 0) {
      return res.status(404).json({
        statuscode: 404,
        message: "Cart is empty.",
      });
    }
    const products = cart.products.filter((item) => !item.product.deleted);

    if (!products === 0) {
      return res.status(404).json({
        statuscode: 404,
        message: "No available product for purchase.",
      });
    }

    const totalCost = products.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );

    const purchaseHistory = new PurchaseHistory({
      user: userId,
      products: products.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
      })),
      totalCost,
    });

    await purchaseHistory.save();

    await User.findByIdAndUpdate(userId, {
      $push: {
        purchaseHistory: purchaseHistory._id,
      },
    });

    cart.products = [];
    cart = await cart.save();

    return res.status(200).json({
      statuscode: 200,
      message: "Product purchased successfully",
      purchaseHistory,
      cart,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      statuscode: 500,
      message: error.message,
    });
  }
}

async function userPurchaseHistory(req, res) {
  try {
    const userId = req.user.userId;
    // const cart = await Cart.findOne({ user: userId });

    // if (!cart) {
    //   return res.status(404).json({
    //     statuscode: 404,
    //     message: "No purchase history.",
    //   });
    // }
    // const userPH = await PurchaseHistory.find({ user: userId }).populate(
    //   "products.product"
    // );

    const userPH = await User.findById(userId).populate("purchaseHistory");

    return res.status(200).json({
      statuscode: 200,
      message: "Purchase History Fetched Successfully",
      purchaseHistory: userPH.purchaseHistory,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      statuscode: 500,
      message: error.message,
    });
  }
}

async function getProductByCategory(req, res) {
  try {
    const { category } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 3;
    const skip = (page - 1) * limit;

    let products = await Product.find({ category, deleted: false })
      .skip(skip)
      .limit(limit);
    // console.log(products);

    if (!products || products.length === 0) {
      return res.status(404).json({
        statuscode: 404,
        message: "No product found",
      });
    }

    return res.status(200).json({
      statuscode: 200,
      totalProduct: products.length,
      data: products,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      statuscode: 500,
      message: error.message,
    });
  }
}

async function getProductUnderCategory(req, res) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    const categories = await Product.distinct("category", {
      deleted: false,
    });
    const categoryProducts = await Promise.all(
      categories.map(async (category) => {
        const products = await Product.find({ category, deleted: false })
          .skip(skip)
          .limit(limit);
        return { category, products };
      })
    );

    return res.status(200).json({
      statuscode: 200,
      message: "Success",
      data: categoryProducts,
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
  signUp,
  userLogin,
  getAllProduct,
  addToCart,
  removeFromCart,
  updateQuantity,
  getTotalCost,
  buyProduct,
  userPurchaseHistory,
  getProductByCategory,
  getProductUnderCategory,
};
