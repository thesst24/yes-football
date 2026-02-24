const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema({
  cardBackground: {
    type: String,
    default: ""
  },
  qrImage: {
    type: String,
    default: ""
  }
}, { timestamps: true });

module.exports = mongoose.model("Setting", settingSchema);