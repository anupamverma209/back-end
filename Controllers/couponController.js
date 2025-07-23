const Coupon = require("../Models/Coupon");
const mongoose = require("mongoose");

// ✅ Create Coupon (Admin)
exports.createCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json(coupon);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Failed to create coupon", error: err.message });
  }
};

// ✅ Update Coupon (Admin)
exports.updateCoupon = async (req, res) => {
  try {
    const { id } = req.body;
    const updatedCoupon = await Coupon.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.status(200).json(updatedCoupon);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Failed to update coupon", error: err.message });
  }
};

// ✅ Delete Coupon (Admin)
exports.deleteCoupon = async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.body.id);
    res.status(200).json({ message: "Coupon deleted successfully" });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Failed to delete coupon", error: err.message });
  }
};

// ✅ Get All Coupons (Admin)
exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.status(200).json(coupons);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to get coupons", error: err.message });
  }
};

// ✅ Get Single Coupon by ID (Admin)
exports.getCouponById = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });
    res.status(200).json(coupon);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to get coupon", error: err.message });
  }
};

// ✅ Apply Coupon (Website Side)
exports.applyCoupon = async (req, res) => {
  try {
    const userId = req.user.id;
    const { code, orderAmount } = req.body;

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
    });

    if (!coupon) {
      return res
        .status(404)
        .json({ message: "Invalid or inactive coupon code." });
    }

    const now = new Date();

    if (now < new Date(coupon.startAt)) {
      return res.status(400).json({ message: "Coupon is not yet valid." });
    }

    if (now > new Date(coupon.expiresAt)) {
      return res.status(400).json({ message: "Coupon has expired." });
    }

    if (orderAmount < coupon.minOrderAmount) {
      return res.status(400).json({
        message: `Minimum order amount should be ₹${coupon.minOrderAmount}`,
      });
    }

    const alreadyUsed = coupon.usedBy.find(
      (u) => u.user.toString() === userId
    );
    if (alreadyUsed) {
      return res
        .status(400)
        .json({ message: "You have already used this coupon." });
    }

    // Calculate discount
    let discount = 0;

    if (coupon.discountType === "flat") {
      discount = coupon.discountValue;
    } else if (coupon.discountType === "percentage") {
      discount = (coupon.discountValue / 100) * orderAmount;
    }

    // Respond with discount info
    res.status(200).json({
      valid: true,
      discount: Math.round(discount),
      message: `Coupon applied. You saved ₹${Math.round(discount)}!`,
    });

    // Save coupon usage (after successful order in real apps)
    coupon.usedBy.push({ user: new mongoose.Types.ObjectId(userId) });
    await coupon.save();
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to apply coupon", error: err.message });
  }
};



exports.couponToggle = async (req, res) => {
  try {
    const { id } = req.body;

    // Find the coupon by ID
    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    // Toggle the isActive field
    coupon.isActive = !coupon.isActive;

    // Save the updated coupon
    await coupon.save();

    res.status(200).json({
      message: `Coupon ${coupon.isActive ? "activated" : "deactivated"} successfully`,
      coupon,
    });
  } catch (error) {
    console.error("Error toggling coupon status:", error);
    res.status(500).json({ message: "Server error" });
  }
};


