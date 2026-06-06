const Address = require("../../models/Address");

const getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ userId: req.user.id }).sort({ isDefault: -1, createdAt: -1 });
    res.json({ success: true, data: addresses });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch addresses." });
  }
};

const addAddress = async (req, res) => {
  try {
    const { fullName, phone, address, city, state, pincode, addressType, isDefault, notes } = req.body;
    if (isDefault) await Address.updateMany({ userId: req.user.id }, { isDefault: false });
    const newAddress = new Address({ userId: req.user.id, fullName, phone, address, city, state, pincode, addressType: addressType || "home", isDefault: isDefault || false, notes: notes || "" });
    await newAddress.save();
    res.status(201).json({ success: true, data: newAddress });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to add address." });
  }
};

const updateAddress = async (req, res) => {
  try {
    const { isDefault, ...rest } = req.body;
    if (isDefault) await Address.updateMany({ userId: req.user.id }, { isDefault: false });
    const address = await Address.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: { ...rest, isDefault: isDefault || false } },
      { new: true }
    );
    if (!address) return res.status(404).json({ success: false, message: "Address not found." });
    res.json({ success: true, data: address });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update address." });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const address = await Address.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!address) return res.status(404).json({ success: false, message: "Address not found." });
    res.json({ success: true, message: "Address deleted." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete address." });
  }
};

module.exports = { getAddresses, addAddress, updateAddress, deleteAddress };
