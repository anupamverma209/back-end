const mongoose = require("mongoose");

const attributeGroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Attribute group name is required"],
      trim: true,
      unique: true,
    },
    displayName: {
      type: String,
      required: [true, "Display name is required"],
      trim: true,
    },
    slug: {
      type: String,
      lowercase: true,
      trim: true,
      unique: true,
    },
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
      default: null,
    },
    isVariant: {
      type: Boolean,
      default: true,
    },
    isFilterable: {
      type: Boolean,
      default: true,
    },
    displayType: {
      type: String,
      enum: ["dropdown", "radio", "checkbox"],
      default: "radio",
      required: [true, "Display type is required"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    published:{
      type:Boolean,
      default:true

    },

    // 🔹 Simplified values array — only value field
    values: [
      {
        type: String,
        required: [true, "Attribute value is required"],
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("AttributeGroup", attributeGroupSchema);