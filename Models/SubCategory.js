const mongoose = require("mongoose");

const subCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Sub-category name is required"],
      trim: true,
      maxlength: 100,
      unique: true,
    },
    slug: {
      type: String,
      lowercase: true,
      trim: true,
    },
    published:{
      type:Boolean,
      default:true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // admin/seller who created the attribute
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SubCategory", subCategorySchema);
