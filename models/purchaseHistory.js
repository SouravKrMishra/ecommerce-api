const mongoose = require("mongoose");

const purchaseHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        product: {
          type: mongoose.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
    totalCost: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const PurchaseHistory = mongoose.model(
  "PurchaseHistory",
  purchaseHistorySchema
);

module.exports = PurchaseHistory;
