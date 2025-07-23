const CMS = require("../Models/CMSSchema");
const cloudinary = require("cloudinary").v2;

// Helper to upload file to Cloudinary
async function fileUploadToCloudinary(file, folder, type = "image") {
  return await cloudinary.uploader.upload(file.tempFilePath, {
    folder,
    resource_type: type,
  });
}

exports.createCMS = async (req, res) => {
  try {
    const {
      homepageBannerText,
      aboutUsTitle,
      aboutUsContent,
      yearsOfExcellence,
      happyCustomers,
      piecesCreated,
      generations,
      mission,
      vision,
    } = req.body;

    // 🔍 Use correct key for uploaded file

    // Check if CMS already exists
    const existingCMS = await CMS.findOne();
    if (existingCMS) {
      return res.status(400).json({
        success: false,
        message: "CMS already created. Please use update instead.",
      });
    }

    // Validate image
    if (!req.files || !req.files.homepageBannerImage) {
      return res.status(400).json({
        success: false,
        message: "Homepage banner image is required.",
      });
    }

    // Upload image to Cloudinary
    const bannerUpload = await fileUploadToCloudinary(
      req.files.homepageBannerImage,
      "Achichiz/CMSHomepage"
    );

    if (!bannerUpload?.url) {
      return res.status(500).json({
        success: false,
        message: "Banner image upload failed",
      });
    }

    // Create CMS document
    const cms = new CMS({
      homepageBannerImage: {
        public_id: bannerUpload.public_id,
        url: bannerUpload.url,
      },
      homepageBannerText,
      aboutUsTitle,
      aboutUsContent,
      stats: {
        yearsOfExcellence,
        happyCustomers,
        piecesCreated,
        generations,
      },
      mission,
      vision,
    });

    await cms.save();

    res.status(201).json({
      success: true,
      message: "CMS created successfully",
      data: cms,
    });
  } catch (error) {
    console.error("❌ Error creating CMS:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong while creating the CMS",
      error: error?.message,
    });
  }
};

exports.getCMS = async (req, res) => {
  try {
    const cms = await CMS.findOne();

    if (!cms) {
      return res.status(404).json({
        success: false,
        message: "CMS content not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "CMS content fetched successfully",
      data: cms,
    });
  } catch (error) {
    console.error("Error fetching CMS:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong while fetching CMS",
    });
  }
};

exports.updateCMS = async (req, res) => {
  try {
    const {
      homepageBannerText,
      aboutUsTitle,
      aboutUsContent,
      yearsOfExcellence,
      happyCustomers,
      piecesCreated,
      generations,
      mission,
      vision,
    } = req.body;

    // Find existing CMS (assuming only 1 exists)
    const cms = await CMS.findOne();
    if (!cms) {
      return res.status(404).json({
        success: false,
        message: "CMS not found",
      });
    }

    // Update text fields
    cms.homepageBannerText = homepageBannerText || cms.homepageBannerText;
    cms.aboutUsTitle = aboutUsTitle || cms.aboutUsTitle;
    cms.aboutUsContent = aboutUsContent || cms.aboutUsContent;
    cms.stats = {
      yearsOfExcellence: yearsOfExcellence || cms.stats.yearsOfExcellence,
      happyCustomers: happyCustomers || cms.stats.happyCustomers,
      piecesCreated: piecesCreated || cms.stats.piecesCreated,
      generations: generations || cms.stats.generations,
    };
    cms.mission = mission || cms.mission;
    cms.vision = vision || cms.vision;

    // Optional: If image provided, replace it
    if (req.files && req.files.homepageBannerImage) {
      // Delete old image from Cloudinary
      if (cms.homepageBannerImage?.public_id) {
        await cloudinary.uploader.destroy(cms.homepageBannerImage.public_id);
      }

      // Upload new image
      const uploaded = await fileUploadToCloudinary(
        req.files.homepageBannerImage,
        "Achichiz/CMSHomepage"
      );

      cms.homepageBannerImage = {
        public_id: uploaded.public_id,
        url: uploaded.url,
      };
    }

    await cms.save();

    res.status(200).json({
      success: true,
      message: "CMS updated successfully",
      data: cms,
    });
  } catch (error) {
    console.error("Error updating CMS:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong while updating the CMS",
    });
  }
};