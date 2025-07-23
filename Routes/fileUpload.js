const express = require("express");

const router = express.Router();
const {
  createProduct,
  getMyProducts,
  updateProduct,
  getSingleProduct,
  deleteProduct,
  getSingleProductById,
  getAllProductsforHome,
  getAllProducts,
} = require("../Controllers/product");
const { auth, isSeller } = require("../Middleware/Auth");
const {
  getSellerOrders,
  updateOrderStatusBySeller,
} = require("../Controllers/SellerOrderController");
const {
  getSellerStats,
  getMonthlySalesData,
  getTopSellingProduct,
} = require("../Controllers/sellerDashboardController");

// create product by seller
router.post("/createProduct", auth, isSeller, createProduct);
router.get("/getAllProducts", auth, isSeller, getMyProducts);
router.put("/updateProduct:id", auth, isSeller, updateProduct);
router.get("/getSingleProduct:id", auth, isSeller, getSingleProduct);
router.delete("/deleteProduct:id", auth, isSeller, deleteProduct);

// Seller Order Routers
router.get("/getOrders", auth, getSellerOrders);
router.put("/UpdateOrder:id", auth, updateOrderStatusBySeller);

// Seller Dashboard Routes
router.get("/getSellerStats", auth, isSeller, getSellerStats);
router.get("/getMonthlySalesData", auth, isSeller, getMonthlySalesData);
router.get("/getTopSellingProduct", auth, isSeller, getTopSellingProduct);
router.get("/getAllProductsforHome", getAllProductsforHome);
router.get("/getSingleProductById/:id", getSingleProductById);
router.get("/getallproductforcategory", getAllProducts);

//get All Product
router.get("/getAllProductsforHome", getAllProductsforHome);
router.get("/getSingleProductById/:id", getSingleProductById);

module.exports = router;