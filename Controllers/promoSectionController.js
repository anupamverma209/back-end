const { error } = require("console");
const PromoSection = require("../Models/PromoSection"); // model import
const cloudinary = require("cloudinary").v2;

const fs = require("fs");

// aapne already import kar liya hai
// Helper: Upload to Cloudinary with dynamic resource_type
async function fileUploadToCloudinary(file, folder, type) {
  return await cloudinary.uploader.upload(file.tempFilePath, {
    folder,
    resource_type: type,
  });
}

exports.createPromoSection = async (req, res) => {
  try {
    const { title, description, link, startDate, endDate, button } = req.body;
    const file = req.files?.image;



    // Validate required fields
    if (!title || !file || !button) {
      return res.status(400).json({
        success: false,
        message: "Title and image file are required",
      });
    }

    // Optional: Validate date formats
    if (startDate && isNaN(Date.parse(startDate))) {
      return res.status(400).json({
        success: false,
        message: "Invalid startDate format",
      });
    }
    if (endDate && isNaN(Date.parse(endDate))) {
      return res.status(400).json({
        success: false,
        message: "Invalid endDate format",
      });
    }

    // Upload image to Cloudinary
    const upload = await fileUploadToCloudinary(
      file,
      "Achichiz/PromoSection",
      "image"
    );

    // Create new promo
    const promo = await PromoSection.create({
      title,
      description,
      link,
      button,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      image: upload.secure_url,
      createdBy: req.user.id, // Make sure auth middleware adds req.user
    });

    res.status(201).json({
      success: true,
      message: "Promo section created successfully",
      promo,
    });
  } catch (error) {
    console.error("Error creating promo section:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.getAllPromos = async (req, res) => {
  try {
    const { isActive, limit, sortBy } = req.query;

    // Build query object
    const query = {};
    if (isActive !== undefined) {
      query.isActive = isActive === "true";
    }

    // Sort options: createdAt (default), startDate, endDate
    const sortOptions = {};
    if (sortBy === "startDate" || sortBy === "endDate") {
      sortOptions[sortBy] = 1; // ascending
    } else {
      sortOptions.createdAt = -1; // latest first
    }

    const promos = await PromoSection.find(query)
      .sort(sortOptions)
      .limit(limit ? parseInt(limit) : 0); // 0 = no limit

    res.status(200).json({
      success: true,
      count: promos.length,
      promos,
    });
  } catch (error) {
    console.error("Error fetching promos:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.getSinglePromo = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId (optional but recommended)
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid promo ID",
      });
    }

    const promo = await PromoSection.findById(id);

    if (!promo) {
      return res.status(404).json({
        success: false,
        message: "Promo not found",
      });
    }

    res.status(200).json({
      success: true,
      promo,
    });
  } catch (error) {
    console.error("Error fetching single promo:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.updatePromoSection = async (req, res) => {
  try {
    const {
      id,
      title,
      description,
      link,
      startDate,
      endDate,
      isActive,
      button,
    } = req.body;

    const file = req.files?.image;

    const promo = await PromoSection.findById(id);
    if (!promo) {
      return res.status(404).json({
        success: false,
        message: "Promo Section not found",
      });
    }

    // Validate date formats
    if (startDate && isNaN(Date.parse(startDate))) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid startDate" });
    }
    if (endDate && isNaN(Date.parse(endDate))) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid endDate" });
    }

    // Upload new image if provided
    if (file) {
      // ✅ Upload new file
      const upload = await fileUploadToCloudinary(
        file,
        "Achichiz/PromoSection",
        "image"
      );

      // ✅ Delete old image from Cloudinary (only if public_id exists)
      if (promo.cloudinaryId) {
        const deletionResult = await cloudinary.uploader.destroy(
          promo.cloudinaryId
        );
        console.log("Deleted from Cloudinary:", deletionResult);
      }

      // ✅ Save new image data
      promo.image = upload.secure_url;
      promo.cloudinaryId = upload.public_id;
    }

    // ✅ Update other fields
    promo.title = title || promo.title;
    promo.description = description || promo.description;
    promo.link = link || promo.link;
    promo.button = button || promo.button;
    promo.startDate = startDate ? new Date(startDate) : promo.startDate;
    promo.endDate = endDate ? new Date(endDate) : promo.endDate;
    promo.isActive = isActive !== undefined ? isActive : promo.isActive;

    await promo.save();

    res.status(200).json({
      success: true,
      message: "Promo Section updated successfully",
      promo,
    });
  } catch (error) {
    console.error("Error updating promo section:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

exports.deletePromoSection = async (req, res) => {
  try {
    const { id } = req.params;

    // Optional: Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid promo ID",
      });
    }

    const promo = await PromoSection.findByIdAndDelete(id);

    if (!promo) {
      return res.status(404).json({
        success: false,
        message: "Promo not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Promo deleted successfully",
      promo,
    });
  } catch (error) {
    console.error("Error deleting promo:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};