const Product = require("../Models/Product");
const Order = require("../Models/Order");
const mongoose = require("mongoose");

exports.getSellerStats = async (req, res) => {
  try {
    const sellerId = req.user.id; // seller ki auth se milta hai

    // 1️⃣ total products count
    const totalProducts = await Product.countDocuments({
      createdBy: sellerId,
    });

    // 2️⃣ total orders and total revenue
    const orders = await Order.find({
      "orderItems.product": { $exists: true },
    }).populate({
      path: "orderItems.product",
      match: { createdBy: sellerId },
      select: "_id price createdBy",
    });

    let totalOrders = 0;
    let totalRevenue = 0;

    orders.forEach((order) => {
      order.orderItems.forEach((item) => {
        if (
          item.product &&
          String(item.product.createdBy) === String(sellerId)
        ) {
          totalOrders += 1;
          totalRevenue += item.price * item.quantity;
        }
      });
    });

    // 3️⃣ optionally delivered orders
    const deliveredOrders = await Order.countDocuments({
      orderStatus: "Delivered",
      "orderItems.product": { $exists: true },
    });

    res.status(200).json({
      success: true,
      data: {
        totalProducts,
        totalOrders,
        totalRevenue,
        deliveredOrders,
      },
    });
  } catch (error) {
    console.error("getSellerStats error", error);
    res.status(500).json({
      success: false,
      message: "Server error while getting seller stats",
    });
  }
};

exports.getMonthlySalesData = async (req, res) => {
  try {
    const sellerId = req.user.id; // seller token se milega
    /**
     * MongoDB aggregation:
     * 1️⃣ unwind orderItems
     * 2️⃣ match seller's products
     * 3️⃣ group by month
     * 4️⃣ calculate total revenue and count of orders
     */

    const pipeline = [
      {
        $unwind: "$orderItems",
      },
      {
        $lookup: {
          from: "products",
          localField: "orderItems.product",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $unwind: "$productDetails",
      },
      {
        $match: {
          "productDetails.createdBy": new mongoose.Types.ObjectId(sellerId),
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          totalRevenue: {
            $sum: {
              $multiply: ["$orderItems.price", "$orderItems.quantity"],
            },
          },
          totalOrders: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ];

    const monthlyData = await Order.aggregate(pipeline);

    res.status(200).json({
      success: true,
      data: monthlyData,
    });
  } catch (error) {
    console.error("getMonthlySalesData error", error);
    res.status(500).json({
      success: false,
      message: "Server error while getting monthly sales data",
    });
  }
};

exports.getTopSellingProduct = async (req, res) => {
  try {
    const sellerId = req.user.id; // seller token se mila hua

    /**
     * MongoDB aggregation:
     * 1️⃣ unwind orderItems
     * 2️⃣ lookup product
     * 3️⃣ filter products created by this seller
     * 4️⃣ group by product to sum quantities
     * 5️⃣ sort desc to get top
     * 6️⃣ limit to top 1
     */

    const pipeline = [
      {
        $unwind: "$orderItems",
      },
      {
        $lookup: {
          from: "products",
          localField: "orderItems.product",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $unwind: "$productDetails",
      },
      {
        $match: {
          "productDetails.createdBy": new mongoose.Types.ObjectId(sellerId),
        },
      },
      {
        $group: {
          _id: "$orderItems.product",
          totalSold: { $sum: "$orderItems.quantity" },
          totalRevenue: {
            $sum: {
              $multiply: ["$orderItems.price", "$orderItems.quantity"],
            },
          },
          product: { $first: "$productDetails" },
        },
      },
      {
        $sort: { totalSold: -1 },
      },
      {
        $limit: 1,
      },
    ];
    // Execute the aggregation pipeline
    console.log(
      "Pipeline for top selling product:",
      JSON.stringify(pipeline, null, 2)
    );

    const result = await Order.aggregate(pipeline);

    res.status(200).json({
      success: true,
      data: result.length > 0 ? result[0] : null,
    });
  } catch (error) {
    console.error("getTopSellingProduct error", error);
    res.status(500).json({
      success: false,
      message: "Server error while getting top selling product",
    });
  }
};
