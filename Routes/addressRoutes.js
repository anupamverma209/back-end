const express = require("express");
const router = express.Router();
const addressController = require("../Controllers/addressController");
const { auth } = require("../Middleware/Auth");

// Create address
router.post("/create", auth, addressController.createAddress);

// Get all addresses for a user
router.get("/getaddress", auth, addressController.getUserAddresses);

// Update address
router.put("/updateaddress/:addressId", auth, addressController.updateAddress);

// Delete address
router.delete(
  "/deleteaddress/:addressId",
  auth,
  addressController.deleteAddress
);

// Set default address
router.patch(
  "/:addressId/set-default",
  auth,
  addressController.setDefaultAddress
);

module.exports = router;
