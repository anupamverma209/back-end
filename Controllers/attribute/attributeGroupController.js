const AttributeGroup = require("../../Models/AttributeGroup");
const subcategories = require("../../Models/SubCategory");
const slugify = require("slugify");
const mongoose = require("mongoose");

exports.createAttributeGroup = async (req, res) => {
  try {
    const {
      name,
      displayName,
      subCategory,
      isVariant = true,
      isFilterable = true,
      displayType = "radio",
      values = [],
    } = req.body;

    // 1. Required fields validation
    if (!name || !displayName || !displayType) {
      return res.status(400).json({
        success: false,
        message: "Name, Display Name, and Display Type are required.",
      });
    }

    // 2. If subCategory is provided, check if it exists
    if (subCategory) {
      const existSubCategory = await subcategories.findById(subCategory);
      if (!existSubCategory) {
        return res.status(400).json({
          success: false,
          message: "SubCategory not found.",
        });
      }
    }

    // 3. Check for duplicate group name
    const existing = await AttributeGroup.findOne({ name: name.trim() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Attribute group with this name already exists.",
      });
    }

    // 4. Prepare slug
    const slug = slugify(name, { lower: true });

    // 5. Validate values array (if provided)
    if (!Array.isArray(values)) {
      return res.status(400).json({
        success: false,
        message: "Values must be an array of strings.",
      });
    }

    for (const val of values) {
      if (typeof val !== "string" || !val.trim()) {
        return res.status(400).json({
          success: false,
          message: "Each attribute value must be a non-empty string.",
        });
      }
    }

    // 6. Create attribute group
    const attributeGroup = await AttributeGroup.create({
      name: name.trim(),
      displayName: displayName.trim(),
      slug,
      subCategory: subCategory || null,
      isVariant,
      isFilterable,
      displayType,
      values: values.map((v) => v.trim()),
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Attribute group created successfully.",
      data: attributeGroup,
    });
  } catch (error) {
    console.error("Error creating attribute group:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating attribute group.",
    });
  }
};

exports.getAllAttributeGroups = async (req, res) => {
  try {
    const { subCategory } = req.query;

    // Filter by subCategory if provided
    const filter = {};
    if (subCategory) {
      filter.subCategory = subCategory;
    }

    const attributeGroups = await AttributeGroup.find(filter)
      .populate("subCategory", "name") // Populate subcategory name
      .populate("createdBy", "name email") // Populate creator info
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: attributeGroups.length,
      data: attributeGroups,
    });
  } catch (error) {
    console.error("Error fetching attribute groups:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching attribute groups.",
      error: error.message,
    });
  }
};

exports.updateAttributeGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      displayName,
      subCategory,
      isVariant,
      isFilterable,
      displayType,
      values, // simplified string array
    } = req.body;

    const group = await AttributeGroup.findById(id);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Attribute group not found",
      });
    }

    // Update name and slug if name has changed
    if (name && name.trim() !== group.name) {
      const trimmedName = name.trim();
      const baseSlug = slugify(trimmedName, { lower: true });
      let newSlug = baseSlug;
      let count = 1;

      while (
        await AttributeGroup.findOne({
          slug: newSlug,
          _id: { $ne: id },
        })
      ) {
        newSlug = `${baseSlug}-${count++}`;
      }

      group.name = trimmedName;
      group.slug = newSlug;
    }

    if (displayName !== undefined) group.displayName = displayName.trim();
    if (subCategory !== undefined) group.subCategory = subCategory;
    if (isVariant !== undefined) group.isVariant = isVariant;
    if (isFilterable !== undefined) group.isFilterable = isFilterable;
    if (displayType !== undefined) group.displayType = displayType;

    // ✅ Update simplified values array if provided
    if (Array.isArray(values)) {
      group.values = values.map((v) => v.trim()).filter(Boolean);
    }

    await group.save();

    res.status(200).json({
      success: true,
      message: "Attribute group updated successfully",
      data: group,
    });
  } catch (error) {
    console.error("Error updating attribute group:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating attribute group",
      error: error.message,
    });
  }
};

exports.deleteAttributeGroup = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid attribute group ID",
      });
    }

    const group = await AttributeGroup.findById(id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Attribute group not found",
      });
    }

    // ❗ Optional: prevent delete if values exist
    // if (group.values && group.values.length > 0) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Cannot delete attribute group with existing values",
    //   });
    // }

    await group.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Attribute group deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting attribute group:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting attribute group",
      error: error.message,
    });
  }
};

exports.getAttributeGroupById = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid attribute group ID",
      });
    }

    const group = await AttributeGroup.findById(id)
      .populate("subCategory", "name")
      .populate("createdBy", "name email");

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Attribute group not found",
      });
    }

    res.status(200).json({
      success: true,
      data: group,
    });
  } catch (error) {
    console.error("Error fetching attribute group by ID:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching attribute group",
      error: error.message,
    });
  }
};
exports.togglePublished = async (req, res) => {
  try {
    const { id } = req.params;

    const attributeGroup = await AttributeGroup.findById(id);
    if (!attributeGroup) {
      return res.status(404).json({ success: false, message: "Attribute group not found" });
    }

    // Toggle the published field
    attributeGroup.published = !attributeGroup.published;
    await attributeGroup.save();

    res.status(200).json({
      success: true,
      message: `Attribute group ${attributeGroup.published ? "published" : "unpublished"} successfully`,
      data: attributeGroup,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while toggling published status",
      error: error.message,
    });
  }
};
