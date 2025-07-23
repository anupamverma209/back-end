const mongoose = require("mongoose");

const ContactUsSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
    },

    phoneNumber: {
      type: Number,
      required: true,
    },

    Category: {
      type: String,
      required: true,
    },

    subject: {
      type: String, // can be URL slug, product ID, or custom link
      required: true,
    },

    message: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Contact", ContactUsSchema);
