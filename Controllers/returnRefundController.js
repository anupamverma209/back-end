const Order = require("../Models/Order"); // Adjust import based on your project structure
const ReturnRefundRequest = require("../Models/Refund"); // Adjust import based on your project structure

const createReturnRefundRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderid } = req.params;
    const { returnReason, refundReason, feedback } = req.body;

    // Find order for this user
    const order = await Order.findOne({ _id: orderid, user: userId });
    if (!order) {
      return res.status(404).json({ message: "Order not found for this user" });
    }

    // Assuming refund is for the first product in orderItems (adjust if needed)
    if (!order.orderItems || order.orderItems.length === 0) {
      return res.status(400).json({ message: "No products found in order" });
    }
    const productId = order.orderItems[0].product;

    // Update order status
    order.orderStatus = "Refund Processing";
    await order.save();

    // Create ReturnRefundRequest with product from order
    const refundRequest = new ReturnRefundRequest({
      user: userId,
      product: productId,
      order: orderid,
      returnReason,
      refundReason,
      feedback,
    });

    await refundRequest.save();

    res.status(201).json({
      message: "Return/Refund request submitted successfully",
      refundRequest,
    });
  } catch (error) {
    console.error("Error creating refund request:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createReturnRefundRequest,
};
