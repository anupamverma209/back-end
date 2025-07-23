const Product = require("../Models/Product");
const Order = require("../Models/Order");

exports.getAllPendingProducts = async (req, res) => {
  try {
    // find products with status Pending
    const pendingProducts = await Product.find({ status: "Pending" })
      .populate("category", "name")
      .populate("subCategory", "name")
      .populate("createdBy", "name email accountType");

    res.status(200).json({
      success: true,
      message: "Pending products fetched successfully",
      data: pendingProducts,
    });
  } catch (error) {
    console.error("Error in getAllPendingProducts controller:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching pending products",
    });
  }
};
// controllers/productController.js

exports.approveProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    // Validate ObjectId
    if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.status === "Approved") {
      return res.status(400).json({
        success: false,
        message: "Product is already approved",
      });
    }

    product.status = "Approved";
    await product.save();

    res.status(200).json({
      success: true,
      message: "Product approved successfully",
      data: {
        id: product._id,
        title: product.title,
        status: product.status,
      },
    });
  } catch (error) {
    console.error("Error in approveProduct controller:", error);
    res.status(500).json({
      success: false,
      message: "Server error while approving product",
    });
  }
};

// controllers/productController.js

exports.rejectProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    // Validate ObjectId
    if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.status === "Rejected") {
      return res.status(400).json({
        success: false,
        message: "Product is already rejected",
      });
    }

    product.status = "Rejected";
    await product.save();

    res.status(200).json({
      success: true,
      message: "Product rejected successfully",
      data: {
        id: product._id,
        title: product.title,
        status: product.status,
      },
    });
  } catch (error) {
    console.error("Error in rejectProduct controller:", error);
    res.status(500).json({
      success: false,
      message: "Server error while rejecting product",
    });
  }
};

// controllers/productController.js

exports.getAllPendingProducts = async (req, res) => {
  try {
    // filters from query
    const {
      category,
      seller,
      fromDate,
      toDate,
      page = 1,
      limit = 10,
    } = req.query;

    // build dynamic filter
    const filter = { status: "Pending" };

    if (category) {
      filter.category = category;
    }

    if (seller) {
      filter.createdBy = seller;
    }

    if (fromDate || toDate) {
      filter.createdAt = {};
      if (fromDate) {
        filter.createdAt.$gte = new Date(fromDate);
      }
      if (toDate) {
        filter.createdAt.$lte = new Date(toDate);
      }
    }

    // calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const total = await Product.countDocuments(filter);

    const products = await Product.find(filter)
      .populate("category", "name")
      .populate("subCategory", "name")
      .populate("createdBy", "name email accountType")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      message: "Filtered pending products fetched successfully",
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: products,
    });
  } catch (error) {
    console.error(
      "Error in getAllPendingProducts controller with filters:",
      error
    );
    res.status(500).json({
      success: false,
      message: "Server error while fetching filtered pending products",
    });
  }
};

// controllers/productController.js

exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    // Validate MongoDB ObjectId
    if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format",
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Optional: delete product images from cloud if required
    /*
    if (product.images && product.images.length > 0) {
      for (const img of product.images) {
        // await cloudinary.uploader.destroy(img.public_id);
      }
    }
    */

    // Clean up related orders (optional)
    // either archive or remove product reference from orderItems
    const affectedOrders = await Order.updateMany(
      { "orderItems.product": productId },
      { $pull: { orderItems: { product: productId } } }
    );

    // Finally delete the product itself
    await Product.findByIdAndDelete(productId);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      ordersUpdated: affectedOrders.modifiedCount,
    });
  } catch (error) {
    console.error("Error in deleteProduct controller:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting product",
    });
  }
};
// controllers/productController.js



exports.setTrendingProducts = async (req, res) => {
  try {
    const { productIds = [] } = req.body;

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ success: false, message: "No product IDs provided." });
    }

    // First, reset all products' trending field to false
    await Product.updateMany({ trending: true }, { $set: { trending: false } });

    // Then, update selected products to trending: true
    await Product.updateMany(
      { _id: { $in: productIds } },
      { $set: { trending: true } }
    );

    return res.status(200).json({
      success: true,
      message: "Trending products updated successfully.",
    });
  } catch (error) {
    console.error("Error updating trending products:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};


//new

