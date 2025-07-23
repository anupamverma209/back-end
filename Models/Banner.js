const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Banner title is required"],
      trim: true,
    },

    subtitle: {
      type: String,
      trim: true,
    },

    description: {
      type: String,
      maxlength: 500,
    },

    coverImage: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },

    backgroundImage: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },

    linkType: {
      type: String,
      enum: ["Product", "Category", "Coupon", "Custom"],
      default: "Custom",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    bannerType: {
      type: String,
      enum: ["Homepage", "Sale", "Festival", "NewArrival", "Other"],
      default: "Homepage",
    },
    button: {
      type: String, 
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // usually Admin or Seller
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Banner", bannerSchema);
