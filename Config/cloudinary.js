// utils/cloudinary.js
const cloudinary = require("cloudinary").v2;
require("dotenv").config();
const cloudinaryStorage = () => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  } catch (err) {
    console.error("Error connecting to Cloudinary:", err);
    throw new Error("Cloudinary connection failed");
  }
};

module.exports = cloudinaryStorage;
