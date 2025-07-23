const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    orderItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
        },
        message:{
          type:String
        }
      },
    ],

    // ✅ Connect to saved shipping address
    shippingAddress: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ShippingAddress",
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: ["COD", "Online"],
      default: "COD",
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Completed", "Failed"],
      default: "Pending",
    },

    totalAmount: {
      type: Number,
      required: true,
    },
    message:{
    type:String
    },
    shippingPrice:{
      type:String
    },

    orderStatus: {
      type: String,
      enum: ["Processing", "Shipped", "Delivered", "Cancelled", "Refunded","Refund Processing"],
      default: "Processing",
    },

    deliveredAt: {
      type: Date,
      default: null,
    },

    isPaid: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
