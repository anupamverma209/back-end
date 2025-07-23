const Settings = require("../Models/Settings");

exports.getSettings = async () => {
  const settings = await Settings.findOne({});
  return settings;
};

exports.saveSettings = async (data) => {
    console.log("Received data:", data);  // debug के लिए add करें
  // Basic validation before saving
  if (!data.supportEmail || !data.contactPhone || !data.address) {
    throw new Error("supportEmail, contactPhone and address are required.");
  }
  
  let settings = await Settings.findOne({});
  if (settings) {
    settings = await Settings.findByIdAndUpdate(settings._id, data, {
      new: true,
      runValidators: true,
    });
  } else {
    settings = await Settings.create(data);
  }
  return settings;
};
