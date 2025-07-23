const mongoose = require("mongoose");

const shippingAddressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },

    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },

    streetAddress: {
      type: String,
      required: [true, "Street address is required"],
    },

    apartment: {
      type: String,
      default: "",
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      match: [
        /^[6-9]\d{9}$/,
        "Please enter a valid 10-digit Indian mobile number",
      ],
    },

    addressLine: {
      type: String,
      required: [true, "Address line is required"],
    },

    landmark: {
      type: String,
      default: "",
    },

    city: {
      type: String,
      required: [true, "City is required"],
    },

    state: {
      type: String,
      required: [true, "State is required"],
    },

    postalCode: {
      type: String,
      required: [true, "Postal Code is required"],
   
    },

    type: {
      type: String,
      enum: ["Home", "Work", "Other"],
      default: "Home",
    },

    isDefault: {
      type: Boolean,
      default: false,
    },

    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ShippingAddress", shippingAddressSchema);
