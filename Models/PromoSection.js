const mongoose = require("mongoose");

const promoSectionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Promo title is required"],
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    image: {
      type: String,
      required: [true, "Promo image is required"],
    },

    link: {
      type: String,
      default: "#",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    startDate: {
      type: Date,
      default: Date.now,
    },

    endDate: {
      type: Date,
    },
    button: {
      type: String,
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Admin/User who created the promo
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("PromoSection", promoSectionSchema);