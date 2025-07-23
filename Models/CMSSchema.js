const mongoose = require("mongoose");

const cmsSchema = new mongoose.Schema({
  homepageBannerImage: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  homepageBannerText: {
    type: String,
    required: true,
  },
  aboutUsTitle: {
    type: String,
    required: true,
  },
  aboutUsContent: {
    type: String,
    required: true,
  },
  stats: {
    yearsOfExcellence: {
      type: String,
      required: true,
    },
    happyCustomers: {
      type: String,
      required: true,
    },
    piecesCreated: {
      type: String,
      required: true,
    },
    generations: {
      type: String,
      required: true,
    },
  },
  mission: {
    type: String,
    required: true,
  },
  vision: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("CMS", cmsSchema);