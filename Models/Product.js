const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Product title is required"],
      trim: true,
      maxlength: 120,
    },

    subTitle: {
      type: String,
      required: [true, "Product sub-title is required"],
      trim: true,
      maxlength: 120,
    },

    description: {
      type: String,
      required: [true, "Product description is required"],
    },

    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price can't be negative"],
    },

    discountedPrice: {
      type: Number,
      min: [0, "Discounted price can't be negative"],
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Product category is required"],
    },

    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
      required: [true, "Product sub-category is required"],
    },

    // Which attributes (Size, Color etc.) apply to this product
variantAttributes: [
  {
    type: String, // Now using group name instead of ObjectId
    required: [true, "Variant attribute (group name) is required"],
    trim: true,
  },
],

variants: [
  {
    attributes: [
      {
        groupName: {
          type: String, // e.g., "Size", "Color"
          required: [true, "Attribute group name is required"],
          trim: true,
        },
        value: {
          type: String, // e.g., "M", "Red"
          required: [true, "Attribute value is required"],
          trim: true,
        },
      },
    ],
    price: {
      type: Number,
      required: [true, "Variant price is required"],
      min: [0, "Price can't be negative"],
    },
    discountedPrice: {
      type: Number,
      min: [0, "Discounted price can't be negative"],
      default: 0,
    },
    stock: {
      type: Number,
      min: 0,
      required: true,
    },
    sku: {
      type: String,
    },
    images: [
      {
        public_id: String,
        url: String,
        type: {
          type: String,
          enum: ["image", "video"],
        },
      },
    ],
  },
],


    // Global fallback stock (if not variant-specific)
    stock: {
      type: Number,
      default: 3,
      min: [0, "Stock can't be negative"],
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        name: String,
        rating: Number,
        comment: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],

    artisan: {
      name: String,
      origin: String,
    },

    material: {
      type: String,
      default: "Mixed",
    },

    tags: [String],

    isHandmade: {
      type: Boolean,
      default: true,
    },

    // General product-level gallery images
    images: [
      {
        public_id: String,
        url: String,
        type: {
          type: String,
          enum: ["image", "video"],
        },
      },
    ],

    ratings: {
      type: Number,
      default: 0,
    },

    numReviews: {
      type: Number,
      default: 0,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    trending: {
      type: Boolean,
      default: false,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Product || mongoose.model("Product", productSchema);