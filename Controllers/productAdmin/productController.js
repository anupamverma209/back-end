const Product = require("../../Models/Product");
const Categories = require("../../Models/Category");
const SubCategories = require("../../Models/SubCategory");
const Review = require("../../Models/Rating");
const AttributeGroup = require("../../Models/AttributeGroup");
const cloudinary = require("cloudinary").v2;


// Helper: Check file type
function isFileTypeSupported(type, supportedTypes) {
  return supportedTypes.includes(type);
}

// Helper: Upload to Cloudinary with dynamic resource_type
async function fileUploadToCloudinary(file, folder, type) {
  return await cloudinary.uploader.upload(file.tempFilePath, {
    folder,
    resource_type: type,
  });
}

// @desc    Create Product with variants and gallery
// @access  Private (Seller only)
exports.createProduct = async (req, res) => {
  try {
    const {
      title,
      subTitle,
      description,
      price,
      discountedPrice,
      category,
      subCategory,
      stock,
      artisanName,
      artisanOrigin,
      material = "Mixed",
      tags = "[]", // फ्रंटएंड से string आ सकता है, इसे JSON.parse करेंगे
      isFeatured = false,
      isHandmade = true,
      trending = false,
      variantAttributes = [],
      variants = [],
      status,
    } = req.body;

    // Tags को array में कन्वर्ट करें अगर string में मिले
    let parsedTags = [];
    if (typeof tags === "string") {
      try {
        parsedTags = JSON.parse(tags);
      } catch {
        parsedTags = [];
      }
    } else if (Array.isArray(tags)) {
      parsedTags = tags;
    }

    // फाइल्स को संभालें
    // ध्यान दें: multer या कोई अन्य middleware सही से नामिंग कर रहा हो
    const imageFiles = req.files?.images || req.files?.image;
    const videoFiles = req.files?.videos || req.files?.video;

    if (
      !title ||
      !subTitle ||
      !description ||
      !price ||
      !category ||
      !subCategory ||
      !imageFiles ||
      (Array.isArray(imageFiles) && imageFiles.length === 0)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Required fields missing. कृपया title, subTitle, description, price, category, subCategory, और कम से कम एक image दें।",
      });
    }

    // Validate category & subcategory
    const categoryExists = await Categories.findById(category);
    const subCategoryExists = await SubCategories.findById(subCategory);
    if (!categoryExists || !subCategoryExists) {
      return res.status(400).json({
        success: false,
        message: "Invalid category या subCategory ID।",
      });
    }

    const supportedImageTypes = ["png", "jpeg", "jpg", "webp"];
    const supportedVideoTypes = ["mp4", "mov", "webm"];
    const mediaArray = [];

    const imageList = Array.isArray(imageFiles) ? imageFiles : [imageFiles];
    const videoList = Array.isArray(videoFiles)
      ? videoFiles
      : videoFiles
      ? [videoFiles]
      : [];

    // इमेज फाइल्स अपलोड करें
    for (const file of imageList) {
      const ext = file.originalname
        ? file.originalname.split(".").pop().toLowerCase()
        : file.name.split(".").pop().toLowerCase();

      if (!supportedImageTypes.includes(ext)) {
        return res
          .status(400)
          .json({ success: false, message: `Unsupported image type: ${ext}` });
      }
      const upload = await fileUploadToCloudinary(
        file,
        "Achichiz/images",
        "image"
      );
      mediaArray.push({
        public_id: upload.public_id,
        url: upload.secure_url,
        type: "image",
      });
    }

    // वीडियो फाइल्स अपलोड करें
    for (const file of videoList) {
      const ext = file.originalname
        ? file.originalname.split(".").pop().toLowerCase()
        : file.name.split(".").pop().toLowerCase();

      if (!supportedVideoTypes.includes(ext)) {
        return res
          .status(400)
          .json({ success: false, message: `Unsupported video type: ${ext}` });
      }
      const upload = await fileUploadToCloudinary(
        file,
        "Achichiz/videos",
        "video"
      );
      mediaArray.push({
        public_id: upload.public_id,
        url: upload.secure_url,
        type: "video",
      });
    }

    // Status वैलिडेट करें
    const allowedStatuses = ["Pending", "Approved", "Rejected"];
    const validStatus = allowedStatuses.includes(status) ? status : "Pending";

    // प्रोडक्ट बनाएं
    const newProduct = new Product({
      title,
      subTitle,
      description,
      price,
      discountedPrice,
      category,
      subCategory,
      stock,
      artisan: { name: artisanName || "", origin: artisanOrigin || "" },
      material,
      tags: parsedTags,
      isFeatured,
      isHandmade,
      trending,
      variantAttributes,
      variants,
      images: mediaArray,
      createdBy: req.user.id,
      ratings: 0,
      numReviews: 0,
      status: validStatus,
    });

    const savedProduct = await newProduct.save();

    return res.status(201).json({
      success: true,
      message: "Product successfully created with variants.",
      data: savedProduct,
    });
  } catch (error) {
    console.error("Product creation error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while creating product.",
    });
  }
};


exports.getMyProducts = async (req, res) => {
  try {
    const userId = req.user.id;

    const products = await Product.find({ createdBy: userId })
      .sort({ createdAt: -1 })
      .populate("category", "name")
      .populate("subCategory", "name")
      .populate("variantAttributes", "name") // Populate attribute groups like Size, Color
      .populate("variants.attributes.group", "name") // Populate group name inside variants
      // Populate actual value (e.g., M, Red)
      .populate("createdBy", "name email"); // Optional: if you want seller info

    return res.status(200).json({
      success: true,
      data: products,
      message: "Products fetched successfully",
    });
  } catch (error) {
    console.error("Error in getMyProducts:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching products",
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user.id;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // ✅ Update basic product fields
    const updatableFields = [
      "title",
      "subTitle",
      "description",
      "price",
      "discountedPrice",
      "stock",
      "category",
      "subCategory",
      "tags",
      "material",
      "isHandmade",
      "isFeatured",
      "trending",
      "variantAttributes",
      "status",
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    // ✅ Handle general product images
    let productImages = [];
    const imageFiles = req.files?.images;

    if (imageFiles) {
      const filesArray = Array.isArray(imageFiles) ? imageFiles : [imageFiles];

      for (const file of filesArray) {
        const uploaded = await fileUploadToCloudinary(file);
        productImages.push({
          public_id: uploaded.public_id,
          url: uploaded.url,
          type: "image",
        });
      }

      // Optional: delete old images from Cloudinary
      for (const img of product.images) {
        if (img.public_id) {
          // await cloudinary.uploader.destroy(img.public_id);
        }
      }

      product.images = productImages;
    }

    await product.save();

    res.status(200).json({
      success: true,
      message: "Product updated successfully (basic + images)",
      data: product,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong while updating the product",
      error: error.message,
    });
  }
};

exports.getSingleProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    // Validate ObjectId format
    if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format",
      });
    }

    // Fetch the product
    const product = await Product.findById(productId)
      .populate("createdBy", "name email accountType")
      .populate("category", "name")
      .populate("subCategory", "name")
      .populate("variantAttributes", "name")
      .populate("variants.attributes.group", "name");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Fetch reviews separately
    const reviews = await Review.find({ product: productId }).populate(
      "user",
      "name"
    );

    return res.status(200).json({
      success: true,
      data: {
        ...product._doc,
        reviews,
      },
      message: "Product fetched successfully",
    });
  } catch (error) {
    console.error("Get single product error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching product",
    });
  }
};



exports.updateProductVariant = async (req, res) => {
  try {
    const { productId, variantIndex } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const index = parseInt(variantIndex);
    if (isNaN(index) || index < 0 || index >= product.variants.length) {
      return res.status(400).json({
        success: false,
        message: "Invalid variant index",
      });
    }

    // Get the specific variant
    const variant = product.variants[index];

    // Update fields
    if (req.body.price !== undefined) variant.price = req.body.price;
    if (req.body.discountedPrice !== undefined)
      variant.discountedPrice = req.body.discountedPrice;
    if (req.body.stock !== undefined) variant.stock = req.body.stock;
    if (req.body.sku !== undefined) variant.sku = req.body.sku;

    if (req.body.attributes) {
      // Allow JSON string or parsed array
      if (typeof req.body.attributes === "string") {
        variant.attributes = JSON.parse(req.body.attributes);
      } else {
        variant.attributes = req.body.attributes;
      }
    }

    // Handle new image uploads
    const imageFile = req.files?.["variantImage"];
    if (imageFile) {
      const filesArray = Array.isArray(imageFile) ? imageFile : [imageFile];
      variant.images = [];

      for (const file of filesArray) {
        const uploaded = await fileUploadToCloudinary(file);
        variant.images.push({
          public_id: uploaded.public_id,
          url: uploaded.url,
          type: "image",
        });
      }
    }

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Variant updated successfully",
      data: product.variants[index],
    });
  } catch (error) {
    console.error("Error updating variant:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update variant",
      error: error.message,
    });
  }
};

exports.createProductVariant = async (req, res) => {
  try {
    const productId = req.params.id;

    // Parse attributes if sent as a string
    if (typeof req.body.attributes === "string") {
      req.body.attributes = JSON.parse(req.body.attributes);
    }

    // ✅ Validate product existence
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // ✅ Upload variant images (if any)
    let variantImages = [];
    const imageFiles = req.files?.variantImage;

    if (imageFiles) {
      const files = Array.isArray(imageFiles) ? imageFiles : [imageFiles];

      for (const file of files) {
        const uploaded = await fileUploadToCloudinary(file);
        variantImages.push({
          public_id: uploaded.public_id,
          url: uploaded.url,
          type: "image",
        });
      }
    }

    // ✅ Create variant object
    const newVariant = {
      attributes: req.body.attributes,
      price: req.body.price,
      discountedPrice: req.body.discountedPrice || 0,
      stock: req.body.stock,
      sku: req.body.sku || "",
      images: variantImages,
    };

    // ✅ Push variant to product
    product.variants.push(newVariant);
    await product.save();

    res.status(201).json({
      success: true,
      message: "Variant added successfully",
      data: product,
    });
  } catch (error) {
    console.error("Error creating product variant:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong while creating the product variant",
      error: error.message,
    });
  }
};

exports.deleteProductVariant = async (req, res) => {
  try {
    const { productId, variantIndex } = req.params;

    // Validate inputs
    if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const index = parseInt(variantIndex);

    if (isNaN(index) || index < 0 || index >= product.variants.length) {
      return res.status(400).json({
        success: false,
        message: "Invalid variant index",
      });
    }

    // Optionally: delete variant's images from cloud (if needed)
    const variantToDelete = product.variants[index];
    if (variantToDelete.images && variantToDelete.images.length > 0) {
      for (const img of variantToDelete.images) {
        if (img.public_id) {
          // await cloudinary.uploader.destroy(img.public_id); // uncomment if using Cloudinary
        }
      }
    }

    // Remove variant at index
    product.variants.splice(index, 1);

    await product.save();

    res.status(200).json({
      success: true,
      message: `Variant at index ${index} deleted successfully`,
      data: product.variants,
    });

  } catch (error) {
    console.error("Error deleting product variant:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete product variant",
      error: error.message,
    });
  }
};