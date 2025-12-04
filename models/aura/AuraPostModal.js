const mongoose = require("mongoose");

const AuraPostSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "AuthUser", required: true },

  title: { type: String, required: true },
  description: { type: String, required: true },

  videoId: { type: mongoose.Schema.Types.ObjectId, required: true },
  thumbnailId: { type: mongoose.Schema.Types.ObjectId, required: true },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("AuraPost", AuraPostSchema);
