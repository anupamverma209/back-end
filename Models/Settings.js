const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    siteTitle: {
      type: String,
      required: true,
      default: "Handicraft Bazaar",
    },
    supportEmail: {
      type: String,
      required: true,
    },
    contactPhone: {
      type: String,
      required: true,
    },
    facebook: {
      type: String,
      default: "",
    },
    instagram: {
      type: String,
      default: "",
    },
    twitter: {
      type: String,
      default: "",
    },
    linkedin: {
      type: String,
      default: "",
    },
    openingTime: {
      type: String,
      default: "10:00 AM",
    },
    closingTime: {
      type: String,
      default: "7:00 PM",
    },
    address: {
      type: String,
      required: true,
    },
    footerText: {
      type: String,
      default: "",
    },
    customerCareItems: {
      type: [String],
      validate: {
        validator: (v) => v.length <= 5,
        message: "You can only have up to 5 customer care items.",
      },
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Settings = mongoose.models.Settings || mongoose.model("Settings", settingsSchema);

module.exports = Settings;
