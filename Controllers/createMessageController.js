const CustomizeMessage = require("../Models/CustomizeMessage");
const cloudinary = require("cloudinary").v2;

// Cloudinary file upload utility
async function fileUploadToCloudinary(file, folder, type) {
  return await cloudinary.uploader.upload(file.tempFilePath, {
    folder,
    resource_type: type,
  });
}

exports.createMessage = async (req, res) => {
  try {
    const { name, mobileNumber, email, link, message } = req.body;

    // Basic field validation
    if (!name || !mobileNumber || !email || !req.files?.image) {
      return res.status(400).json({
        success: false,
        message: "Name, mobile number, email and image are required.",
      });
    }

    const file = req.files.image;
    const uploadResult = await fileUploadToCloudinary(
      file,
      "Achichiz/customizeMessage", // Folder name
      "image"
    );

    const newMessage = new CustomizeMessage({
      name,
      mobileNumber,
      email,
      link,
      message,
      image: {
        public_id: uploadResult.public_id,
        url: uploadResult.secure_url,
      },
    });

    await newMessage.save();

    res.status(201).json({
      success: true,
      message: "Message submitted successfully.",
      data: newMessage,
    });
  } catch (error) {
    console.error("createMessage error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while submitting message.",
    });
  }
};

exports.getAllCustomizeMessages = async (req, res) => {
  try {
    const messages = await CustomizeMessage.find().sort({ createdAt: -1 }); // latest first

    res.status(200).json({
      success: true,
      message: "All messages fetched successfully.",
      total: messages.length,
      data: messages,
    });
  } catch (error) {
    console.error("getAllCustomizeMessages error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch messages. Server error.",
    });
  }
};

exports.deleteCustomizeMessage = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format",
      });
    }

    const message = await CustomizeMessage.findById(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Customize message not found",
      });
    }

    // Delete image from Cloudinary
    if (message.image?.public_id) {
      await cloudinary.uploader.destroy(message.image.public_id);
    }

    // Delete message from database
    await CustomizeMessage.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Customize message deleted successfully",
    });
  } catch (error) {
    console.error("deleteCustomizeMessage error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting message",
    });
  }
};

exports.getSingleCustomizeMessageById = async (req, res) => {
  try {
    const { id } = req.body;

    // Validate presence of id
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID is required in request body",
      });
    }

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format",
      });
    }

    const message = await CustomizeMessage.findById(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Customize message not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Message fetched successfully",
      data: message,
    });
  } catch (error) {
    console.error("getSingleCustomizeMessageById error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching message",
    });
  }
};