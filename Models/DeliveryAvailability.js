const mongoose = require("mongoose");

const deliveryAvailabilitySchema = new mongoose.Schema(
  {
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
    ],
    pincode: {
      type: String,
      required: true,
    },
    areas: {
      type: [String],
      default: [],
    },
    availability: {
      type: Boolean,
      default: true,
    },
    deliveryOptions: [
      {
        type: {
          type: String,
          enum: ["oneDay", "standard"],
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("DeliveryAvailability", deliveryAvailabilitySchema);