const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // optional: can be admin/seller
    },

    type: {
      type: String,
      enum: [
        "order",
        "review",
        "coupon",
        "wishlist",
        "product",
        "system",
        "message",
      ],
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    relatedOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },

    relatedProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },

    relatedCoupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Notification", notificationSchema);
