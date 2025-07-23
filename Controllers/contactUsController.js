const Contact = require("../Models/Contact");

exports.createContact = async (req, res) => {
  try {
    const { name, email, subject, message, phone, category } = req.body;

    const contact = new Contact({
      name,
      email,
      subject,
      message,
      phone,
      category,
      user: req.user ? req.user._id : undefined, // agar authenticated user hai
    });

    await contact.save();

    res.status(201).json({
      success: true,
      message: "Contact message submitted successfully",
      data: contact,
    });
  } catch (error) {
    console.error("createContact error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while submitting contact message",
    });
  }
};

exports.getAllContactsMessage = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 }); // latest first

    res.status(200).json({
      success: true,
      message: "All contact messages fetched successfully",
      total: contacts.length,
      data: contacts,
    });
  } catch (error) {
    console.error("getAllContacts error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching contacts",
    });
  }
};

exports.deleteContactMessage = async (req, res) => {
  try {
    const { id } = req.params;

    // Check for valid ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid contact ID format",
      });
    }

    const contact = await Contact.findById(id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found",
      });
    }

    await Contact.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Contact message deleted successfully",
    });
  } catch (error) {
    console.error("deleteContact error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting contact message",
    });
  }
};

exports.getContactMessageById = async (req, res) => {
  try {
    const { id } = req.body;

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid contact ID format",
      });
    }

    const contact = await Contact.findById(id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Contact message fetched successfully",
      data: contact,
    });
  } catch (error) {
    console.error("getContactById error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching contact message",
    });
  }
};