const router = require("express").Router();
// const getAllCards = require("../Controllers/Card");
const {
  createBlog,
  updateBlog,
  deleteBlog,
  getSingleBlogById,
  getAllBlogs,
  commentOnBlog,
  deleteComment,
} = require("../Controllers/blogController");
const {
  signup,
  verifyOtp,
  reSendOtp,
  Login,
  sendOtp,
  verifyOtpAndLogin,
  logout,
  SignupByMobile,
  forgotPassword,
  resetPassword,
  verifyForgotPasswordOtp,
  googleLogin,
} = require("../Controllers/Auth");
const { auth, isAdmin, isUser, isSeller } = require("../Middleware/Auth");
const {
  createReview,
  updateReview,
  deleteReview,
  getAllReviewsForProduct,
} = require("../Controllers/ratingControllers");
const {
  getUserProfile,
  changePassword,
  updateUserProfile,
  addToCartController,
  removeCartItem,
  addToWishlistController,
  removeFromWishlistController,
} = require("../Controllers/userProfileController");
const {
  createOrder,
  getMyOrders,
  getSingleOrder,
  cancelOrder,
  updateOrderStatus,
  getAllOrders,
  deleteOrder,
} = require("../Controllers/userOrderController");
const User = require("../Models/User");

const {
  createContact,
  getAllContactsMessage,
  deleteContactMessage,
  getContactMessageById,
} = require("../Controllers/contactUsController");
const {
  createReturnRefundRequest,
} = require("../Controllers/returnRefundController");

router.post("/send-otp", sendOtp); // mobile number signup
router.post("/verify-otp", verifyOtpAndLogin); // mobile number login user
router.post("/logout", auth, logout);
router.post("/signup", signup);
//router.post("/signupByMobile", SignupByMobile);
router.post("/verify", verifyOtp); //email login signup varification
router.post("/login", Login);
router.post("/reSendOtp", reSendOtp);
router.post("/forgotPassword", forgotPassword);
router.post("/resetPassword", resetPassword);
router.post("/forgototpverify", verifyForgotPasswordOtp);

// signup By mobile number

// All Review Controllers
router.post("/createRating", auth, isUser, createReview);
router.put("/updateReview/:reviewId", auth, updateReview);
router.delete("/deleteReview/:reviewId", auth, deleteReview);
router.get("/getAllReviews/:productId", getAllReviewsForProduct);

// user profile route
router.get("/userProfile", auth, getUserProfile);
router.post("/changePassword", auth, changePassword);
router.put("/updateUserProfile", auth, updateUserProfile);

// create order Router
router.post("/createOrder", auth, isUser, createOrder);
router.get("/getAllOrder", auth, isUser, getMyOrders);
router.get("/getSingleOrder/:id", auth, getSingleOrder);
router.put("/cancelOrder:id", auth, cancelOrder);
router.put("/updateOrderStatus:id", auth, isAdmin, updateOrderStatus); // only for Admin
router.get("/getAllOrders", auth, isAdmin, getAllOrders); //private route for admin to get
router.delete("/deleteOrder:id", auth, deleteOrder); // delete order by id
router.post("/refund-request/:orderid", auth, createReturnRefundRequest);

// private routes for different user roles
router.get("/Admin", auth, (req, res) => {
  // res.send("Welcome to the Admin dashboard");
  res.status(200).json({
    message: "User authenticated successfully",
    success: true,
    user: req.user,
  });
});

router.get("/User", auth, isUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password -confirmPassword")
      .populate("addtocart")
      .populate("orders")
      .populate("addtowishlist");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User authenticated successfully",
      user: user,
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching user data",
      error: error.message,
    });
  }
});

router.get("/Seller", auth, isSeller, (req, res) => {
  res.send("Welcome to the Seller dashboard");
  res.status(200).json({
    message: "User authenticated successfully",
    success: true,
    user: req.user,
  });
});
router.put("/updateUserProfile", auth, updateUserProfile);
router.post("/addtocart/:productid", auth, isUser, addToCartController);
router.patch("/removeitem/:productid", auth, isUser, removeCartItem);
router.post("/addtowishlist/:productid", auth, isUser, addToWishlistController);
router.patch(
  "/removefromwishlist/:productid",
  auth,
  isUser,
  removeFromWishlistController
);

router.post("/createBlog", auth, createBlog); // create blog
router.put("/updateBlog", auth, updateBlog); // update blog
router.delete("/deleteBlog", auth, deleteBlog);
router.get("/getSingleBlogById/:id", getSingleBlogById);
router.get("/getSingleBlogById/:id", getSingleBlogById);
router.get("/getAllBlogs", getAllBlogs); // first test this route
router.post("/commentOnBlog/:id", auth, commentOnBlog);
router.delete("/blogs/:blogId/comments/:commentId", auth, deleteComment);
// router.patch("/blogs/:id/views", incrementViews);

// contact US Route

router.post("/createContact", createContact);
router.get("/getAllcontactsMessage", auth, isAdmin, getAllContactsMessage);
router.delete("/deleteContact/:id", auth, isAdmin, deleteContactMessage);
router.get("/getContactMessageById", auth, isAdmin, getContactMessageById);

// google auth routes
router.get("/auth/google/callback", googleLogin);
router.get("/auth/google", (req, res) => {
  const url = oauth2client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["profile", "email", "name"],
    redirect_uri: process.env.CALLBACK_URL, // explicitly set redirect_uri
  });
  res.redirect(url);
});

module.exports = router;
