const Address = require("../Models/Address");

// ✅ Create new address
exports.createAddress = async (req, res) => {
  try {
    const user = req.user.id;
    const { name, addressType, address, city, state, pin, phone, isDefault } =
      req.body;

    // If isDefault is true, unset other default addresses
    if (isDefault) {
      await Address.updateMany({ user }, { isDefault: false });
    }

    const newAddress = new Address({
      user,
      name,
      addressType,
      address,
      city,
      state,
      pin,
      phone,
      isDefault,
    });

    await newAddress.save();
    return res.status(201).json(newAddress);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Failed to create address", error: err.message });
  }
};

// ✅ Get all addresses for a user
exports.getUserAddresses = async (req, res) => {
  try {
    const userId = req.user.id;
    const addresses = await Address.find({ user: userId }).sort({
      isDefault: -1,
      createdAt: -1,
    });
    return res.status(200).json(addresses);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Failed to fetch addresses", error: err.message });
  }
};

// ✅ Update address
exports.updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const updateData = req.body;

    // If updated to default, unset others
    if (updateData.isDefault) {
      const existing = await Address.findById(addressId);
      await Address.updateMany({ user: existing.user }, { isDefault: false });
    }

    const updated = await Address.findByIdAndUpdate(addressId, updateData, {
      new: true,
    });
    res.status(200).json(updated);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update address", error: err.message });
  }
};

// ✅ Delete address
exports.deleteAddress = async (req, res) => {
  try {
    await Address.findByIdAndDelete(req.params.addressId);
    return res.status(200).json({ message: "Address deleted successfully" });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Failed to delete address", error: err.message });
  }
};

// ✅ Set default address
exports.setDefaultAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const address = await Address.findById(addressId);
    if (!address) return res.status(404).json({ message: "Address not found" });

    await Address.updateMany({ user: address.user }, { isDefault: false });
    address.isDefault = true;
    await address.save();

    return res
      .status(200)
      .json({ message: "Default address set successfully", address });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Failed to set default address", error: err.message });
  }
};
