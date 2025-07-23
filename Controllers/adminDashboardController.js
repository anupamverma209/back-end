const User = require("../Models/User");
const Order = require("../Models/Order");
const Product = require("../Models/Product");
const Category =require("../Models/Category")
const SubCategory=require("../Models/SubCategory")

// controllers/adminDashboardController.js
exports.getOverviewStats = async (req, res) => {
  try {
    // 1️⃣ All users
    const users = await User.find({}, "_id name email accountType");

    // 2️⃣ Active sellers with basic info
    const activeSellers = await User.find(
      { accountType: "Seller", isActive: true },
      "_id name email"
    );

    // 3️⃣ Products with title and price
    const products = await Product.find({}, "_id title price");

    // 4️⃣ Orders with populated user and products
    const orders = await Order.find({})
      .populate({
        path: "user",
        select: "_id name email",
      })
      .populate({
        path: "orderItems.product",
        select: "_id title price",
      });

    // 5️⃣ Revenue & Avg Order Value
    const orderStats = await Order.aggregate([
      { $match: { paymentStatus: "Completed" } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          avgOrderValue: { $avg: "$totalAmount" },
        },
      },
    ]);

    const totalRevenue = orderStats[0]?.totalRevenue || 0;
    const avgOrderValue = orderStats[0]?.avgOrderValue || 0;

    // 6️⃣ Categories & SubCategories
    const categories = await Category.find({}, "_id name");
    const subCategories = await SubCategory.find({}, "_id name");

    // 7️⃣ Orders grouped by status with full data
    const rawOrdersByStatus = await Order.find({})
      .populate("user", "name email")
      .populate("orderItems.product", "title price");

    const orderStatusData = {};
    rawOrdersByStatus.forEach((order) => {
      const status = order.orderStatus || "Unknown";
      if (!orderStatusData[status]) {
        orderStatusData[status] = [];
      }
      orderStatusData[status].push(order);
    });

    res.status(200).json({
      success: true,
      data: {
        users,
        activeSellers,
        products,
        orders,
        totalRevenue,
        avgOrderValue,
        categories,
        subCategories,
        orderStatusData, // { Delivered: [...], Processing: [...], etc. }
      },
    });
  } catch (err) {
    console.error("getOverviewStats error:", err);
    res.status(500).json({
      success: false,
      message: "Server error while fetching overview stats",
    });
  }
};

// controllers/adminDashboardController.js

exports.getTopSellingProducts = async (req, res) => {
  try {
    // N value query param se ya default 5
    const topN = parseInt(req.query.top) || 5;

    // aggregation pipeline
    const topProducts = await Order.aggregate([
      // unwind to flatten orderItems array
      { $unwind: "$orderItems" },

      // group by product to get quantity + revenue
      {
        $group: {
          _id: "$orderItems.product",
          totalQuantitySold: { $sum: "$orderItems.quantity" },
          totalRevenue: { $sum: "$orderItems.price" },
        },
      },

      // sort by quantity sold descending
      { $sort: { totalQuantitySold: -1 } },

      // limit to topN products
      { $limit: topN },

      // lookup product details
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },

      // lookup seller details
      {
        $lookup: {
          from: "users",
          localField: "product.createdBy",
          foreignField: "_id",
          as: "seller",
        },
      },
      { $unwind: { path: "$seller", preserveNullAndEmptyArrays: true } },

      // project final shape
      {
        $project: {
          productId: "$_id",
          title: "$product.title",
          totalQuantitySold: 1,
          totalRevenue: 1,
          stockLeft: "$product.stock",
          seller: {
            _id: "$seller._id",
            name: "$seller.name",
            email: "$seller.email",
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: topProducts,
    });
  } catch (err) {
    console.error("getTopSellingProducts error:", err);
    res.status(500).json({
      success: false,
      message: "Server error while fetching top selling products",
    });
  }
};

exports.getRecentOrders = async (req, res) => {
  try {
    // kitne recent orders lana hai — default 10
    const limit = parseInt(req.query.limit) || 10;

    const orders = await Order.find()
      .sort({ createdAt: -1 }) // recent first
      .limit(limit)
      .populate({
        path: "user",
        select: "name email",
      })
      .populate({
        path: "orderItems.product",
        select: "title price images",
      });

    res.status(200).json({
      success: true,
      data: orders.map((order) => ({
        orderId: order._id,
        buyer: {
          name: order.user?.name || "Unknown",
          email: order.user?.email || "",
        },
        totalAmount: order.totalAmount,
        status: order.orderStatus,
        createdAt: order.createdAt,
        items: order.orderItems.map((item) => ({
          productId: item.product?._id,
          title: item.product?.title,
          price: item.price,
          quantity: item.quantity,
          image: item.product?.images?.[0]?.url || "",
        })),
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error while fetching recent orders",
    });
  }
};

exports.getMonthlyRevenueChart = async (req, res) => {
  try {
    // by default last 12 months
    const currentDate = new Date();
    const lastYearDate = new Date();
    lastYearDate.setFullYear(currentDate.getFullYear() - 1);

    const revenueData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: lastYearDate },
          paymentStatus: "Completed",
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          totalRevenue: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);

    // optionally map to human-readable month
    const formattedData = revenueData.map((item) => ({
      year: item._id.year,
      month: item._id.month,
      totalRevenue: item.totalRevenue,
      orderCount: item.orderCount,
    }));

    res.status(200).json({
      success: true,
      data: formattedData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error while calculating monthly revenue",
    });
  }
};
