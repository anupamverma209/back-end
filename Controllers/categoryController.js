// controllers/categoryController.js

const Category = require("../Models/Category");
const SubCategory = require("../Models/SubCategory");
const slugify = require("slugify");
const mongoose = require("mongoose");

// create category controller

exports.createCategory = async (req, res) => {
  try {
    const { name, subCategories } = req.body;

    // ✅ 1. Validate category name
    if (!name || name.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }
    // ✅ 2. Check if category already exists
    const existing = await Category.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Category already exists",
      });
    }

    // ✅ 3. Generate slug
    const slug = slugify(name, { lower: true });

    // ✅ 4. Prepare category data
    const categoryData = {
      name: name.trim(),
      slug,
    };

    // ✅ 5. If subCategories are provided, validate ObjectIds
    if (Array.isArray(subCategories) && subCategories.length > 0) {
      const validSubCategoryIds = subCategories
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id));

      categoryData.subCategories = validSubCategoryIds;
    }

    // ✅ 6. Create and save the category
    const category = await Category.create(categoryData);

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    console.error("Create Category Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating category",
      error: error.message,
    });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({ published: true }) // filter for published only
      .populate("subCategories") // populate all subcategory details
      .sort({ createdAt: -1 }); // sort newest first

    res.status(200).json({
      success: true,
      message: "All published categories fetched successfully",
      count: categories.length,
      categories,
    });
  } catch (error) {
    console.error("Get All Categories Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching categories",
      error: error.message,
    });
  }
};


//update category controller

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params; // Category ID
    const { name, subCategories } = req.body;

    // 1. Find category by ID
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // 2. Update name and slug if provided
    if (name) {
      category.name = name.trim();
      category.slug = slugify(name, { lower: true });
    }

    // 3. Update subCategories if provided
    if (Array.isArray(subCategories)) {
      const validSubCategoryIds = subCategories
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id));
      category.subCategories = validSubCategoryIds;
    }

    // 4. Save updated category
    await category.save();

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    console.error("Update Category Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating category",
      error: error.message,
    });
  }
};

// delete category controller
// controllers/categoryController.js

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Check if category exists
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // 2. Delete category
    await Category.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Delete Category Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting category",
      error: error.message,
    });
  }
};



exports.toggleCategoryPublished = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    category.published = !category.published;

    await category.save();

    res.status(200).json({
      success: true,
      message: `Category is now ${category.published ? "published" : "unpublished"}`,
      category,
    });
  } catch (error) {
    console.error("Toggle error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle published status",
    });
  }
};
