const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    phone: {
      type: Number,
    },
    category: {
      type: String,
      enum: [
        "Genral Inquiry",
        "Order Support",
        "Product Question",
        "Shipping & Returns",
        "Technical Support",
        "Billing & Payment",
        "Complaint",
        "Other",
      ],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
    },

    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
    },

    message: {
      type: String,
      required: [true, "Message is required"],
      maxlength: 2000,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Optional: agar logged-in user ne bheja ho
    },

    isReplied: {
      type: Boolean,
      default: false,
    },

    reply: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Contact", contactSchema);