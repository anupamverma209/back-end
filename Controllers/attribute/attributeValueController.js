const AttributeValue = require("../../Models/AttributeValue");

exports.createAttributeValue = async (req, res) => {
  try {
    const { group, value, code, isDefault = false } = req.body;

    // 1. Validation
    if (!group || !value) {
      return res.status(400).json({
        success: false,
        message: "Group ID and value are required.",
      });
    }

    // 2. (Optional) Prevent duplicates within the same group
    const existing = await AttributeValue.findOne({
      group,
      value: value.trim(),
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Value already exists in this attribute group.",
      });
    }

    // 3. Create the value
    const newValue = await AttributeValue.create({
      group,
      value: value.trim(),
      code: code?.trim() || "",
      isDefault,
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Attribute value created successfully.",
      data: newValue,
    });
  } catch (error) {
    console.error("Error creating attribute value:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating attribute value.",
    });
  }
};

exports.getValuesByGroupId = async (req, res) => {
  try {
    const groupId = req.params.id;

    if (!groupId) {
      return res.status(400).json({
        success: false,
        message: "Attribute group ID is required.",
      });
    }

    const values = await AttributeValue.find({ group: groupId }).sort({
      createdAt: 1,
    });

    res.status(200).json({
      success: true,
      count: values.length,
      data: values,
    });
  } catch (error) {
    console.error("Error fetching attribute values:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching attribute values.",
    });
  }
};

exports.deleteAttributeValue = async (req, res) => {
  try {
    const { id } = req.params;

    const value = await AttributeValue.findById(id);

    if (!value) {
      return res.status(404).json({
        success: false,
        message: "Attribute value not found",
      });
    }

    await value.deleteOne();

    res.status(200).json({
      success: true,
      message: "Attribute value deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting attribute value:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting attribute value",
    });
  }
};

exports.updateAttributeValue = async (req, res) => {
  try {
    const { id } = req.params;
    const { value, code, isDefault } = req.body;

    // 1. Find existing value
    const existingValue = await AttributeValue.findById(id);
    if (!existingValue) {
      return res.status(404).json({
        success: false,
        message: "Attribute value not found",
      });
    }

    // 2. Update fields (only if provided)
    if (value) existingValue.value = value.trim();
    if (code !== undefined) existingValue.code = code?.trim() || "";
    if (isDefault !== undefined) existingValue.isDefault = isDefault;

    // 3. Save the updated value
    await existingValue.save();

    res.status(200).json({
      success: true,
      message: "Attribute value updated successfully",
      data: existingValue,
    });
  } catch (error) {
    console.error("Error updating attribute value:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating attribute value",
    });
  }
};
