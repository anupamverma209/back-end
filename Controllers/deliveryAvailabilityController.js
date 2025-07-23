// controllers/deliveryAvailabilityController.js

const DeliveryAvailability = require("../Models/DeliveryAvailability");

exports.setDeliveryAvailability = async (req, res) => {
  try {
    const {
      productIds,
      pincode,
      deliveryOptions,
      area,
      availability = true,
    } = req.body;

    // Validate input
    if (
      !Array.isArray(productIds) ||
      productIds.length === 0 ||
      !pincode ||
      !Array.isArray(deliveryOptions) ||
      deliveryOptions.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Product IDs, Pincode, and Delivery Options are required",
      });
    }

    for (const option of deliveryOptions) {
      if (
        !option.type ||
        !["oneDay", "standard"].includes(option.type) ||
        typeof option.price !== "number"
      ) {
        return res.status(400).json({
          success: false,
          message: "Each delivery option must include a valid type and price",
        });
      }
    }

    let delivery = await DeliveryAvailability.findOne({ pincode });

    if (delivery) {
      // Add unique productIds
      for (const id of productIds) {
        if (!delivery.products.includes(id)) {
          delivery.products.push(id);
        }
      }

      // Add unique areas
      if (!Array.isArray(delivery.areas)) {
        delivery.areas = [];
      }

      if (area && Array.isArray(area)) {
        for (const a of area) {
          if (!delivery.areas.includes(a)) {
            delivery.areas.push(a);
          }
        }
      }

      delivery.deliveryOptions = deliveryOptions;
      delivery.availability = availability;

      await delivery.save();
    } else {
      // Create new entry
      delivery = await DeliveryAvailability.create({
        products: productIds,
        pincode,
        areas: area || [],
        deliveryOptions,
        availability,
      });
    }

    res.status(200).json({ success: true, data: delivery });
  } catch (error) {
    console.error("DeliveryAvailability error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 1. Get all delivery availabilities full list with product titles
exports.getAllDeliveryAvailabilities = async (req, res) => {
  try {
    const { productId } = req.query;

    const filter = {};
    if (productId) {
      filter.products = productId; // filter where productId exists in the products array
    }

    const availabilities = await DeliveryAvailability.find(filter)
      .populate("products", "title") // populate 'title' of each product in array
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: availabilities });
  } catch (error) {
    console.error("getAllDeliveryAvailabilities error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Get by product + pincode
exports.getDeliveryByPincode = async (req, res) => {
  try {
    const { productId, pincode } = req.body;

    // Validate input
    if (!productId || !pincode) {
      return res.status(400).json({
        success: false,
        message: "Both productId and pincode are required.",
      });
    }

    // Find record where productId exists in 'products' array and pincode matches
    const data = await DeliveryAvailability.findOne({
      products: productId,
      pincode,
    }).populate("products", "title");

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Delivery not available for this pincode.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Delivery info found",
      data,
    });
  } catch (error) {
    console.error("getDeliveryByPincode error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// 3. Delete delivery availability by pincode
exports.deleteDeliveryByPincode = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "id is required.",
      });
    }

    const deleted = await DeliveryAvailability.findOneAndDelete(id );

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "No delivery record found for the given pincode.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Delivery availability deleted successfully.",
      data: deleted,
    });
  } catch (error) {
    console.error("deleteDeliveryByPincode error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.getAllDeliveryAvailabilityForProduct = async (req, res) => {
  try {
    const { pincode } = req.body;

    const data = await DeliveryAvailability.find({ pincode: pincode }).populate(
      "products",
      "title"
    );

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};