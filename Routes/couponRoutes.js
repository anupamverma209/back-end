const express = require("express");
const router = express.Router();
const couponController = require("../Controllers/couponController");
const { isAdmin, auth } = require("../Middleware/Auth");

// Admin Panel Routes
router.post("/admin/createcoupon",auth ,isAdmin, couponController.createCoupon);
router.put("/admin/updatecoupon",auth, isAdmin, couponController.updateCoupon);
router.delete("/admin/deletecoupon",auth, isAdmin, couponController.deleteCoupon);
router.get("/admin/getallcoupons",auth, couponController.getAllCoupons);
router.get("/admin/getcouponbyid/:id",auth, couponController.getCouponById);
router.put("/admin/toggle", couponController.couponToggle);

// Website Side Route
router.post("/apply-coupon", auth, couponController.applyCoupon); // user applies coupon code

module.exports = router;
