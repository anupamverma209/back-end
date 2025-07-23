const express = require("express");
const router = express.Router();
const { auth, isAdmin } = require("../Middleware/Auth");

const {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
  toggleCategoryPublished,
} = require("../Controllers/categoryController");
const {
  createSubCategory,
  getAllSubCategories,
  deleteSubCategory,
  updateSubCategory,
  getSubCategory,
  toggleSubCategoryPublish,
} = require("../Controllers/subCategoryController");
const {
  getAllUsers,
  getUserById,
  getSellers,
  getBuyers,
  getAllAdmin,
  blockOrUnblockUser,
  deleteUser,
} = require("../Controllers/adminUserController");
const {
  getAllPendingProducts,
  approveProduct,
  rejectProduct,
  deleteProduct,
  setTrendingProducts,

} = require("../Controllers/adminProductController");

const {
  getAllOrders,
  updateOrderStatus,
  deleteOrders,
  getOrderById,
} = require("../Controllers/adminOrderController");
const {
  getOverviewStats,
  getTopSellingProducts,
  getRecentOrders,
  getMonthlyRevenueChart,
} = require("../Controllers/adminDashboardController");
const {
  createBanner,
  getAllBanners,
  updateBanner,
  deleteBanner,
} = require("../Controllers/BannerController");
const {
  createAttributeGroup,
  getAllAttributeGroups,
  updateAttributeGroup,
  deleteAttributeGroup,
  getAttributeGroupById,
  togglePublished,
} = require("../Controllers/attribute/attributeGroupController");

const {
  createProduct,
  getMyProducts,
  
} = require("../Controllers/productAdmin/productController");
const { updateProduct: adminUpdateProduct } = require("../Controllers/productAdmin/productController");
const {

  
  updateProductVariant,
  createProductVariant,
  deleteProductVariant,
} = require("../Controllers/productAdmin/productController");

const {
  getAllPromos,
  createPromoSection,
  getSinglePromo,
  updatePromoSection,
  deletePromoSection,
} = require("../Controllers/promoSectionController");
const { getAllReviewsByAdmin,deleteReviewByAdmin } = require("../Controllers/ratingControllers");
const { getSettings, saveSettings } = require("../Controllers/settingsController");

const { getCMS, createCMS, updateCMS } = require("../Controllers/cmsContoller");
const { getAllProducts, updateProduct, getSingleProduct, getSingleProductById } = require("../Controllers/product");
const controller = require("../Controllers/deliveryAvailabilityController");


const CustomizeMessage = require("../Controllers/createMessageController");
router.post("/createMessage", CustomizeMessage.createMessage);
router.get(
  "/getAllMessages",
  auth,
  isAdmin,
  CustomizeMessage.getAllCustomizeMessages
);
router.delete(
  "/deleteMessage/:id",
  auth,
  isAdmin,
  CustomizeMessage.deleteCustomizeMessage
);
router.get(
  "/getMessage",
  auth,
  isAdmin,
  CustomizeMessage.getSingleCustomizeMessageById
);


// Create, Update, Delete, and Get Categories
router.post("/createCategory", auth, isAdmin, createCategory);
router.put("/updateCategory/:id", auth, isAdmin, updateCategory);
router.delete("/deleteCategory/:id", auth, isAdmin, deleteCategory);
router.get("/getAllCategories", getAllCategories);
router.put("/categorytoggle/:id",auth,isAdmin, toggleCategoryPublished);

// create subcategory update delete and get subcategories
router.post("/createSubCategory", auth, isAdmin, createSubCategory);
router.get("/getAllSubCategories", auth, isAdmin, getAllSubCategories);
router.get("/getSubcategories/:id", getSubCategory);
router.put("/updateSubCategory/:id", auth, isAdmin, updateSubCategory);
router.delete("/deleteSubCategory/:id", auth, isAdmin, deleteSubCategory);
router.put("/toggleSubCategory/:id",auth,isAdmin,toggleSubCategoryPublish);

// Admin User Routes
router.delete("/deleteUser", auth, isAdmin, deleteUser);
router.get("/getAllUsers", auth, isAdmin, getAllUsers);
router.post("/getUserById", auth, isAdmin, getUserById);
router.get("/getSellers", auth, isAdmin, getSellers);
router.get("/getBuyers", auth, isAdmin, getBuyers);
router.get("/getAllAdmin", auth, isAdmin, getAllAdmin);
router.patch("/blockOrUnblockUser/:id", auth, isAdmin, blockOrUnblockUser);

// Admin Product Routes
router.get("/getAllPendingProducts", auth, isAdmin, getAllPendingProducts);
router.patch("/approveProduct/:id", auth, isAdmin, approveProduct);
router.patch("/rejectProduct/:id", auth, isAdmin, rejectProduct);
// router.delete("/deleteProducts/:id", deleteProduct);


//getAllProducts route likhna hai

// Admin Order Routes
router.get("/getAllOrders", auth, isAdmin, getAllOrders);
router.post("/updateOrderStatus", auth, isAdmin, updateOrderStatus);
router.post("/deleteOrder", auth, isAdmin, deleteOrders);
router.get("/getOrderById/:orderId", auth, isAdmin, getOrderById);

// Admin Dashboard Routes
router.get("/getOverviewStats", auth, isAdmin, getOverviewStats);
router.get("/getTopSellingProducts", auth, isAdmin, getTopSellingProducts);
router.get("/getRecentOrders", auth, isAdmin, getRecentOrders);
router.get("/getMonthlyRevenueChart", auth, isAdmin, getMonthlyRevenueChart);

// Banner Route
router.post("/banner", auth, isAdmin, createBanner);
router.put("/updateBanner/:id", auth, isAdmin, updateBanner);
router.delete("/deleteBanner/:id", auth, isAdmin, deleteBanner);
router.get("/getAllBanner", getAllBanners);

//Attribute Group
router.post("/createAttributeGroup", auth, isAdmin, createAttributeGroup);
router.get("/getAllAttributeGroup", getAllAttributeGroups);
router.put("/updateAttributeGroup/:id", auth, isAdmin, updateAttributeGroup);
router.delete("/deleteAttributeGroup/:id", auth, isAdmin, deleteAttributeGroup);
router.get("/getAttributeGroupById/:id", auth, isAdmin, getAttributeGroupById);
router.patch("/togglepublish/:id",auth,isAdmin,togglePublished)



// product Routes
router.post("/createProduct", auth, isAdmin, createProduct);
router.get("/getMyProducts", getMyProducts);

router.get("/getSingleProductforadmin/:id",getSingleProductById);
router.delete("/deleteProductforadmin/:id",auth,isAdmin,deleteProduct)
router.put("/updateProductforadmin/:id", auth, isAdmin, adminUpdateProduct);
// routes/admin.js
//PromoSection
router.post("/PromoSection", auth, isAdmin, createPromoSection);
router.get("/getAllPromos", getAllPromos);
router.get("/getSinglePromo/:id", getSinglePromo);
router.put("/updatePromoSection", auth, isAdmin, updatePromoSection);
router.delete("/deletePromoSection", auth, isAdmin, deletePromoSection);

router.get("/getAllReviewsByAdmin", auth, isAdmin, getAllReviewsByAdmin);
router.get("/getAllReviewsByuser", getAllReviewsByAdmin);
router.delete("/deleteReviewByAdmin", auth, isAdmin, deleteReviewByAdmin);
router.get("/getsettinginfo", auth, isAdmin, async (req, res) => {
  try {
    const settings = await getSettings();
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get("/getsettinginfoforuser", async (req, res) => {
  try {
    const settings = await getSettings();
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST save settings route
router.post("/createsettingsinfo", auth, isAdmin, async (req, res) => {
  try {
    const data = req.body;
    const savedSettings = await saveSettings(data);
    res.status(200).json(savedSettings);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/set-trending",auth,isAdmin, setTrendingProducts);

router.post("/createCMS", auth, isAdmin, createCMS);
router.get("/getCMS", getCMS);
router.put("/updateCMS", auth, isAdmin, updateCMS);



router.post(
  "/setDeliveryAvailability",
  auth,
  isAdmin,
  controller.setDeliveryAvailability
);
router.post("/getDeliveryByPincode", controller.getDeliveryByPincode);
router.delete(
  "/deleteDeliveryByPincode/:id",
  auth,
  isAdmin,
  controller.deleteDeliveryByPincode
);
router.get(
  "/getAllDeliveryAvailabilities",
  controller.getAllDeliveryAvailabilities
);

router.get(
  "/getAllDeliveryAvailabilityForProduct",
  controller.getAllDeliveryAvailabilityForProduct
);

router.get("/getsettinginfo", auth, isAdmin, async (req, res) => {
  try {
    const settings = await getSettings();
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put(
  "/product/:productId/variant/:variantIndex",
  auth,
  isAdmin,
  updateProductVariant
);
router.post("/createProductVariant/:id", auth, isAdmin, createProductVariant);
router.delete("/deleteProductVariant/:productId/:variantIndex", auth, isAdmin, deleteProductVariant);

module.exports = router;