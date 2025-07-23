const Banner = require("../Models/Banner");
const cloudinary = require("cloudinary").v2;

// Helper to upload file to Cloudinary
async function fileUploadToCloudinary(file, folder, type = "image") {
  return await cloudinary.uploader.upload(file.tempFilePath, {
    folder,
    resource_type: type,
  });
}

exports.createBanner = async (req, res) => {
  try {
    const {
      title,
      subtitle,
      description,
      linkType,
      isActive,
      bannerType,
      button,
    } = req.body;

    // Validate uploaded files
    if (!req.files || !req.files.coverImage || !req.files.backgroundImage) {
      return res.status(400).json({
        success: false,
        message: "Both coverImage and backgroundImage are required.",
      });
    }

    // Upload both images
    const coverImageUpload = await fileUploadToCloudinary(
      req.files.coverImage,
      "Achichiz/Banner/Cover"
    );

    const backgroundImageUpload = await fileUploadToCloudinary(
      req.files.backgroundImage,
      "Achichiz/Banner/Background"
    );

    // Validate uploads
    if (!coverImageUpload?.url || !backgroundImageUpload?.url) {
      return res.status(500).json({
        success: false,
        message: "Image upload failed",
      });
    }

    // Create banner
    const banner = new Banner({
      title,
      subtitle,
      button,
      description,
      coverImage: {
        public_id: coverImageUpload.public_id,
        url: coverImageUpload.url,
      },
      backgroundImage: {
        public_id: backgroundImageUpload.public_id,
        url: backgroundImageUpload.url,
      },
      linkType,
      isActive,
      bannerType,
      createdBy: req.user?.id, // from auth middleware
    });

    await banner.save();

    res.status(201).json({
      success: true,
      message: "Banner created successfully",
      banner,
    });
  } catch (error) {
    console.error("Error creating banner:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong while creating the banner",
    });
  }
};

exports.getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true }).sort({
      createdAt: -1,
    }); // newest first

    res.status(200).json({
      success: true,
      total: banners.length,
      banners,
    });
  } catch (error) {
    console.error("Error fetching banners:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve banners",
    });
  }
};

exports.updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      subtitle,
      description,
      linkType,
      linkRef,
      isActive,
      bannerType,
    } = req.body;

    const banner = await Banner.findById(id);
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    // Update coverImage if new file is provided
    if (req.files?.coverImage) {
      // Optional: delete previous image from Cloudinary
      if (banner.coverImage?.public_id) {
        await cloudinary.uploader.destroy(banner.coverImage.public_id);
      }

      const coverImageUpload = await fileUploadToCloudinary(
        req.files.coverImage,
        "Achichiz/Banner/Cover"
      );
      banner.coverImage = {
        public_id: coverImageUpload.public_id,
        url: coverImageUpload.url,
      };
    }

    // Update backgroundImage if new file is provided
    if (req.files?.backgroundImage) {
      // Optional: delete previous image from Cloudinary
      if (banner.backgroundImage?.public_id) {
        await cloudinary.uploader.destroy(banner.backgroundImage.public_id);
      }

      const backgroundImageUpload = await fileUploadToCloudinary(
        req.files.backgroundImage,
        "Achichiz/Banner/Background"
      );
      banner.backgroundImage = {
        public_id: backgroundImageUpload.public_id,
        url: backgroundImageUpload.url,
      };
    }

    // Update other fields
    banner.title = title || banner.title;
    banner.subtitle = subtitle || banner.subtitle;
    banner.description = description || banner.description;
    banner.linkType = linkType || banner.linkType;
    banner.linkRef = linkRef || banner.linkRef;
    banner.isActive = isActive ?? banner.isActive;
    banner.bannerType = bannerType || banner.bannerType;

    await banner.save();

    res.status(200).json({
      success: true,
      message: "Banner updated successfully",
      banner,
    });
  } catch (error) {
    console.error("Error updating banner:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong while updating the banner",
    });
  }
};

exports.deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;

    // Find banner by ID
    const banner = await Banner.findById(id);
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    // Delete coverImage from Cloudinary
    if (banner.coverImage?.public_id) {
      await cloudinary.uploader.destroy(banner.coverImage.public_id);
    }

    // Delete backgroundImage from Cloudinary
    if (banner.backgroundImage?.public_id) {
      await cloudinary.uploader.destroy(banner.backgroundImage.public_id);
    }

    // Delete banner from DB
    await Banner.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Banner deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting banner:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong while deleting the banner",
    });
  }
};
