const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      trim: true,
    },
    discount: {
      type: Number,
      default: 0, // Default discount is 0 if not provided
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt fields
  }
);

// Ensure that the product and user fields are indexed for faster queries
// Prevent duplicate reviews by the same user for a product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
