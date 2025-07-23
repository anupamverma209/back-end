const mongoose = require("mongoose");

const mobileSchema = new mongoose.Schema({
  mobile: {
    type: String,
    required: true,
  },
  accountType: {
    type: String,
    default: "User",
  },
  otp: String,
  otpExpires: { type: Date },
});

module.exports = mongoose.model("Mobile", mobileSchema);
