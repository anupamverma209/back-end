const mongoose = require('mongoose');

const returnRefundSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',       // User model ka reference
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',    // Product model ka reference
    required: true,
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',      // Order model ka reference
    required: true,
  },
  returnReason: {
    type: String,
    required: true,
  },
  refundReason: {
    type: String,
    required: true,
  },
  feedback: {
    type: String,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ReturnRefundRequest = mongoose.model('ReturnRefundRequest', returnRefundSchema);

module.exports = ReturnRefundRequest;
