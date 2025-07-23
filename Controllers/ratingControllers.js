const Review = require("../Models/Rating");
const Product = require("../Models/Product");

// create review controller and alse update product DB
const createReview = async (req, res) => {
  try {
    const { product, rating, review } = req.body;
    const userId = req.user.id; // Must come from auth middleware
    const userName = req.user.name;

    if (!product || !rating) {
      return res.status(400).json({
        success: false,
        message: "Product ID and rating are required",
      });
    }

    // 1. Create the review
    const newReview = await Review.create({
      product,
      user: userId,
      rating,
      review,
    });

    // 2. Push review into the product's reviews array
    const updatedProduct = await Product.findById(product);
    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // 3. Push into embedded product reviews
    updatedProduct.reviews.push({
      user: userId,
      name: userName,
      rating,
      comment: review,
    });

    // 4. Recalculate ratings
    const totalRating = updatedProduct.reviews.reduce(
      (sum, r) => sum + r.rating,
      0
    );
    updatedProduct.ratings = totalRating / updatedProduct.reviews.length;
    updatedProduct.numReviews = updatedProduct.reviews.length;

    await updatedProduct.save();

    return res.status(201).json({
      success: true,
      message: "Review created successfully",
      review: newReview,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this product",
      });
    }

    console.error("Review creation error:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while creating the review",
    });
  }
};

//Update Review controller also update product DB
const updateReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { reviewId } = req.params;
    const { rating, review } = req.body;

    if (!rating) {
      return res
        .status(400)
        .json({ success: false, message: "Nothing to update" });
    }

    // 1. Find the review
    const existingReview = await Review.findOne({
      _id: reviewId,
      user: userId,
    });
    if (!existingReview) {
      return res.status(404).json({
        success: false,
        message: "Review not found or unauthorized",
      });
    }
    // 2. Update review fields
    if (rating) existingReview.rating = rating;
    if (review) existingReview.review = review;

    await existingReview.save();

    // 3. Update embedded review inside Product model
    const product = await Product.findById(existingReview.product);

    const embeddedReview = product.reviews.find(
      (r) => r.user.toString() === userId.toString()
    );
    if (embeddedReview) {
      if (rating) embeddedReview.rating = rating;
      if (review) embeddedReview.comment = review;
    }

    // 4. Recalculate average rating
    const totalRating = product.reviews.reduce((sum, r) => sum + r.rating, 0);
    product.ratings = totalRating / product.reviews.length;
    await product.save();
    return res.status(200).json({
      success: true,
      message: "Review updated successfully",
      updatedReview: existingReview,
    });
  } catch (error) {
    console.error("Update review error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating review",
    });
  }
};

const deleteReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { reviewId } = req.params;

    // 1. Find the review by ID and user (only review owner can delete)
    const existingReview = await Review.findOne({
      _id: reviewId,
      user: userId,
    });

    if (!existingReview) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found or unauthorized" });
    }

    const productId = existingReview.product;

    // 2. Delete review from Review collection
    await Review.deleteOne({ _id: reviewId });

    // 3. Update Product model: remove from embedded reviews array
    const product = await Product.findById(productId);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Associated product not found" });
    }

    // Filter out the deleted review
    product.reviews = product.reviews.filter(
      (r) => r.user.toString() !== userId.toString()
    );

    // Recalculate rating and numReviews
    const totalRating = product.reviews.reduce((sum, r) => sum + r.rating, 0);
    product.numReviews = product.reviews.length;
    product.ratings =
      product.numReviews === 0 ? 0 : totalRating / product.numReviews;

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Delete review error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting review",
    });
  }
};

const getAllReviewsForProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    console.log(productId);
    const mongoose = require("mongoose");

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    if (!productId) {
      return res.status(401).json({
        success: false,
        message: "product Id not Found",
      });
    }

    // Check if the product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Get all reviews for the product
    const reviews = await Review.find({ product: productId })
      .populate("user", "name email") // populate user info
      .sort({ createdAt: -1 }); // latest reviews first

    return res.status(200).json({
      success: true,
      totalReviews: reviews.length,
      reviews,
    });
  } catch (error) {
    console.error("Error fetching product reviews:", error);
    return res.status(500).json({
      success: false,
      message: "Error while fetching reviews",
    });
  }
};
const getAllReviewsByAdmin = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate({
        path: "product",
        select: "title slug images", // Select only needed fields from product
      })
      .populate({
        path: "user",
        select: "name email", // Select only needed fields from user
      })
      .sort({ createdAt: -1 }); // Optional: latest reviews first

    res.status(200).json({
      success: true,
      message: "All reviews fetched successfully",
      data: reviews,
    });
  } catch (error) {
    console.error("Error in getAllReviews controller:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching reviews",
    });
  }
};
const deleteReviewByAdmin = async (req, res) => {
  try {
    const reviewId = req.body.id;

    // Check if the review exists
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Delete the review
    await Review.findByIdAndDelete(reviewId);

    res.status(200).json({
      success: true,
      message: "Review deleted successfully by admin",
    });
  } catch (error) {
    console.error("Error in deleteReviewByAdmin controller:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting review",
    });
  }
};

module.exports = {
  createReview,
  updateReview,
  deleteReview,
  getAllReviewsForProduct,
  getAllReviewsByAdmin,
  deleteReviewByAdmin
};
