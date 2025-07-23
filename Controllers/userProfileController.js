const mongoose = require("mongoose");
const User = require("../Models/User");
const bcrypt = require("bcrypt");
const cloudinary = require("cloudinary").v2;
const Product=require("../Models/Product")
// const Product = require("../Models/Product");

async function fileUploadToCloudinary(file, folder, type) {
  return await cloudinary.uploader.upload(file.tempFilePath, {
    folder,
    resource_type: type, // 'image' or 'video'
  });
}

exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id; // JWT se aya hua user
    const user = await User.findById(userId)
      .select("-password -confirmPassword -otp -otpExpires")
      .populate("orders");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: err.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    // get data from req body
    const userId = req.user.id;
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    // check all field filed or not
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return res.status(401).json({
        success: false,
        message: "All fields are required",
      });
    }
    // check new password or confirmed password are equal or not
    if (newPassword !== confirmNewPassword) {
      return res
        .status(400)
        .json({ success: false, message: "New passwords do not match" });
    }

    // here find this user exist in my database or not
    const user = await User.findById(userId);

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.confirmPassword = hashedPassword;

    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Password change failed",
      error: err.message,
    });
  }
};

// controllers/userController.js

exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      name,
      email,
      mobileNumber,
      gender,
      dateOfBirth,
      alternativeMobileNumber,
      hintName,
      location,
    } = req.body;

    const updatedData = {};

    if (name) updatedData.name = name;
    if (email) updatedData.email = email;
    if (mobileNumber) updatedData.mobileNumber = mobileNumber;
    if (gender) updatedData.gender = gender;
    if (dateOfBirth) updatedData.dateOfBirth = dateOfBirth;
    if (alternativeMobileNumber)
      updatedData.alternativeMobileNumber = alternativeMobileNumber;
    if (hintName) updatedData.hintName = hintName;
    if (location) updatedData.location = location;

    // yaha image upload handle karenge
    if (req.files && req.files.image) {
      const file = req.files.image;
      const uploadedImage = await fileUploadToCloudinary(
        file,
        "Achichiz/user-profile"
      );
      updatedData.image = uploadedImage.secure_url;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updatedData },
      { new: true, runValidators: true }
    ).select("-password -confirmPassword");

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};



exports.addToCartController = async (req, res) => {
  try {
    const userId = req.user.id; // from auth middleware
    const { productid } = req.params;

    if (!productid) {
      return res
        .status(400)
        .json({ success: false, message: "Product ID is missing in URL." });
    }

    // Check if product exists
    const product = await Product.findById(productid);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found." });
    }

    // Find the user
    const user = await User.findById(userId);

    // Check if product is already in cart
    if (user.addtocart.includes(productid)) {
      return res
        .status(409)
        .json({ success: false, message: "Product already in cart." });
    }

    // Add product to cart
    user.addtocart.push(productid);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Product added to cart.",
      cart: user.addtocart,
    });
  } catch (error) {
    console.error("❌ Error in addToCartController:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.removeCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productid } = req.params;

    if (!productid) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $pull: {
          addtocart: new mongoose.Types.ObjectId(productid),
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Item removed from cart successfully" });
  } catch (error) {
    console.error("Remove Cart Item Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Add to Wishlist
exports.addToWishlistController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productid } = req.params;

    if (!productid) {
      return res
        .status(400)
        .json({ success: false, message: "Product ID is missing in URL." });
    }

    const product = await Product.findById(productid);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found." });
    }

    const user = await User.findById(userId);

    if (user.addtowishlist.includes(productid)) {
      return res
        .status(409)
        .json({ success: false, message: "Product already in wishlist." });
    }

    user.addtowishlist.push(productid);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Product added to wishlist.",
      wishlist: user.addtowishlist,
    });
  } catch (error) {
    console.error("❌ Error in addToWishlistController:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Remove from Wishlist
exports.removeFromWishlistController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productid } = req.params;

    if (!productid) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $pull: {
          addtowishlist: new mongoose.Types.ObjectId(productid),
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res
      .status(200)
      .json({ message: "Item removed from wishlist successfully" });
  } catch (error) {
    console.error("Remove Wishlist Item Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

