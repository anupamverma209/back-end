const Order = require("../Models/Order");
const Product = require("../Models/Product");
const User = require("../Models/User");

exports.getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.user.id; //  from auth middleware

    // Step 1: Fetch all orders, populate user and product info
    const allOrders = await Order.find()
      .populate("user", "name email") // only name and email of buyer
      .populate("orderItems.product", "title price createdBy images");

    // Step 2: Filter only those orderItems where product.createdBy === sellerId
    const sellerOrders = [];

    for (const order of allOrders) {
      // Filter products created by this seller
      const sellerItems = order.orderItems.filter((item) => {
        const product = item.product;
        return (
          product &&
          product.createdBy &&
          product.createdBy.toString() === sellerId
        );
      });

      if (sellerItems.length > 0) {
        sellerOrders.push({
          _id: order._id,
          user: order.user,
          shippingInfo: order.shippingInfo,
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus,
          totalAmount: order.totalAmount,
          orderStatus: order.orderStatus,
          isPaid: order.isPaid,
          deliveredAt: order.deliveredAt,
          createdAt: order.createdAt,
          orderItems: sellerItems, // only seller's items
        });
      }
    }

    return res.status(200).json({
      success: true,
      count: sellerOrders.length,
      orders: sellerOrders,
    });
  } catch (error) {
    console.error("Error fetching seller orders:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch seller orders",
    });
  }
};

exports.updateOrderStatusBySeller = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const { orderId, updates } = req.body;

    /**
     * Expected structure of `updates` in req.body:
     * updates: [
     *   {
     *     productId: "productObjectId",
     *     status: "Shipped" | "Delivered" | "Cancelled"
     *   },
     *   ...
     * ]
     */

    if (!orderId || !Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "orderId and valid updates array are required",
      });
    }

    const order = await Order.findById(orderId).populate("orderItems.product");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    let updated = false;

    for (const update of updates) {
      const { productId, status } = update;

      // Validate status
      const validStatuses = ["Processing", "Shipped", "Delivered", "Cancelled"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status: ${status}`,
        });
      }

      // Find the matching item in the order
      const item = order.orderItems.find(
        (item) =>
          item.product &&
          item.product._id.toString() === productId &&
          item.product.createdBy.toString() === sellerId
      );

      if (!item) {
        continue; // Skip if item is not created by this seller
      }

      // Update order-level status (optional: could be done only when all items shipped)
      order.orderStatus = status;
      updated = true;
    }

    if (!updated) {
      return res.status(403).json({
        success: false,
        message: "No products found in this order that belong to you",
      });
    }

    // If delivered, update delivery timestamp
    if (order.orderStatus === "Delivered") {
      order.deliveredAt = new Date();
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      updatedStatus: order.orderStatus,
    });
  } catch (error) {
    console.error("Seller status update failed:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while updating order status",
    });
  }
};
