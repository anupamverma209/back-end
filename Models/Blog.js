const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Blog title is required"],
      trim: true,
      maxlength: 200,
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },

    content: {
      type: String,
      required: [true, "Blog content is required"],
    },

    summary: {
      type: String,
      maxlength: 500,
      default: "",
    },

    coverImage: {
      public_id: String,
      url: String,
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    categories: [
      {
        type: String,
        enum: [
          "Wood",
          "Textile",
          "Metal",
          "Clay",
          "Glass",
          "Culture",
          "Tips",
          "Other",
        ],
        default: "Other",
      },
    ],

    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    status: {
      type: String,
      enum: ["Draft", "Published"],
      default: "Draft",
    },

    views: {
      type: Number,
      default: 0,
    },

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        comment: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],

    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Blog", blogSchema);