const mongoose = require("mongoose");

const customizeMessageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    mobileNumber: {
      type: String,
      required: true,
      match: /^[0-9]{10}$/, // 10-digit number validation
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, // basic email format
    },
    image: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
    link: {
      type: String,
      trim: true,
    },
    message: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CustomizeMessage", customizeMessageSchema);