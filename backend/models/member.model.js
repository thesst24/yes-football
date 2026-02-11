const mongoose = require('mongoose');


const memberSchema = new mongoose.Schema({
  image: String,
  fullname: { type: String, required: true },
  nickname: String,
  guardian: String,
  dateOfBirth: Date,
  whatsapp: { type: String, required: true, unique: true },
  status: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Member', memberSchema);
